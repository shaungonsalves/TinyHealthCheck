import { useEffect, useCallback } from 'react';
import { useStatus as useStatusContext } from '../context/StatusContext';
import { useConfig } from '../context/ConfigContext';
import { logger } from '../logger';
import { fetchStatus } from '../services/api';

export const useStatus = () => {
    const { config } = useConfig();
    const { statuses, setStatuses, showError } = useStatusContext();

    const refresh = useCallback(async () => {
        if (!config) return;
        try {
            const data = await fetchStatus(config.apiBase);
            logger.info({ statuses: data }, 'Manual refresh');
            setStatuses(data);
        } catch (err: any) {
            showError(err.message);
        }
    }, [config, setStatuses, showError]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addTarget = async (url: string) => {
        if (!config) return;
        try {
            const res = await fetch(`${config.apiBase}/targets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const data = await res.json();
                const error = new Error(data.error || 'Failed to add target');
                showError(error.message); // optional global error
                throw error; // re-throw so the form can catch it
            }

            setStatuses((prev) => ({
                ...prev,
                [url]: { up: null, latency: null, lastChecked: null },
            }));
            logger.info({ url }, 'Target added');
        } catch (err: any) {
            // For network errors or re-thrown API errors
            showError(err.message);
            throw err; // ensure form catches it
        }
    };

    return { statuses, addTarget, refresh };
};