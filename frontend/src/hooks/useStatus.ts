import { useEffect, useCallback } from 'react';
import { useStatus as useStatusContext } from '../context/StatusContext';
import { fetchStatus, addTarget as apiAddTarget } from '../services/api';
import { logger } from '../logger';

export const useStatus = () => {
  const { statuses, setStatuses, showError } = useStatusContext();

  const refresh = useCallback(async () => {
    try {
      const data = await fetchStatus();
      logger.info({ statuses: data }, 'Manual refresh');
      setStatuses(data);
    } catch (err: any) {
      showError(err.message);
    }
  }, [setStatuses, showError]);

  useEffect(() => {
    refresh(); // initial load
  }, [refresh]);

  const addTarget = async (url: string) => {
    try {
      await apiAddTarget(url);
      setStatuses((prev) => ({
        ...prev,
        [url]: { up: null, latency: null, lastChecked: null },
      }));
      logger.info({ url }, 'Target added');
    } catch (err: any) {
      showError(err.message);
    }
  };

  return { statuses, addTarget, refresh };
};