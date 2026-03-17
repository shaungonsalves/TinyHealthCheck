import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AppConfig {
    apiBase: string;
    defaultInterval: number;
    maxReconnectAttempts: number;
    baseReconnectDelay: number;
    availableIntervals: number[];
}

interface ConfigContextType {
    config: AppConfig | null;
    loading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/config.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load config');
                return res.json();
            })
            .then((data: AppConfig) => {
                setConfig(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, error }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
