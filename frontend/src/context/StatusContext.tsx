import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { StatusMap, StatusContextType } from '../types';

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string | null) => {
    setError(message);
    if (message) {
      setTimeout(() => setError(null), 6000);
    }
  }, []); // ✅ stable identity

  return (
    <StatusContext.Provider value={{ statuses, setStatuses, error, setError, showError }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = (): StatusContextType => {
  const context = React.useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};