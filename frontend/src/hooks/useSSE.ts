import { useEffect, useRef, useState } from 'react';
import { useStatus } from '../context/StatusContext';
import { logger } from '../logger';

const API_BASE = '/api';
const MAX_RECONNECT_ATTEMPTS = 5; // for demo; adjust as needed
const BASE_RECONNECT_DELAY = 1000;

export const useSSE = () => {
  const { setStatuses, showError } = useStatus();
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<number>();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API_BASE}/events`);
    eventSourceRef.current = es;

    es.onopen = () => {
      logger.info('SSE connected');
      setIsConnected(true);
      setRetryCount(0);
      reconnectAttempts.current = 0;
      showError(null); // clear any previous connection error
    };

    es.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setStatuses((prev) => ({
          ...prev,
          [update.url]: {
            up: update.up,
            latency: update.latency,
            lastChecked: update.lastChecked,
          },
        }));
      } catch (e) {
        logger.error({ error: e }, 'Failed to parse SSE');
      }
    };

    es.onerror = () => {
      logger.error('SSE error');
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        showError(
          `Connection lost. Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`
        );
        setRetryCount(reconnectAttempts.current + 1);

        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay) as unknown as number;
      } else {
        showError('Unable to reconnect. Please refresh manually.');
        setRetryCount(MAX_RECONNECT_ATTEMPTS);
      }
    };
  };

  const reconnect = () => {
    reconnectAttempts.current = 0;
    setRetryCount(0);
    connect();
  };

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  return { isConnected, retryCount, reconnect };
};