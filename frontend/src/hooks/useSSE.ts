import { useEffect, useRef, useState } from 'react';
import { useStatus } from '../context/StatusContext';
import { useConfig } from '../context/ConfigContext';
import { logger } from '../logger';

export const useSSE = () => {
  const { config } = useConfig();
  const { setStatuses } = useStatus(); 
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<number>();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = () => {
    if (!config) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${config.apiBase}/events`);
    eventSourceRef.current = es;

    es.onopen = () => {
      logger.info('SSE connected');
      setIsConnected(true);
      setRetryCount(0);
      reconnectAttempts.current = 0;
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

      if (reconnectAttempts.current < config.maxReconnectAttempts) {
        const delay = config.baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
        setRetryCount(reconnectAttempts.current + 1);

        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay) as unknown as number;
      } else {
        setRetryCount(config.maxReconnectAttempts);
      }
    };
  };

  const reconnect = () => {
    reconnectAttempts.current = 0;
    setRetryCount(0);
    connect();
  };

  useEffect(() => {
    if (config) {
      connect();
    }
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [config]);

  return { isConnected, retryCount, reconnect };
};