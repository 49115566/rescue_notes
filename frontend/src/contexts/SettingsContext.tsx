import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  defaultStorageType: 'local' | 'cloud';
  setDefaultStorageType: (type: 'local' | 'cloud') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [defaultStorageType, setDefaultStorageTypeState] = useState<'local' | 'cloud'>('local');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedStorageType = localStorage.getItem('rescue-notes-default-storage');
    if (savedStorageType === 'cloud' || savedStorageType === 'local') {
      setDefaultStorageTypeState(savedStorageType);
    }
  }, []);

  const setDefaultStorageType = (type: 'local' | 'cloud') => {
    setDefaultStorageTypeState(type);
    localStorage.setItem('rescue-notes-default-storage', type);
  };

  const value: SettingsContextType = {
    defaultStorageType,
    setDefaultStorageType,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
