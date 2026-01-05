import React, { createContext, useContext, ReactNode } from 'react';
import { useImpersonation, UseImpersonationReturn } from '@/hooks/useImpersonation';

const ImpersonationContext = createContext<UseImpersonationReturn | null>(null);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const impersonation = useImpersonation();

  return (
    <ImpersonationContext.Provider value={impersonation}>
      {children}
    </ImpersonationContext.Provider>
  );
}

// Default-Werte für den Fallback (falls Provider fehlt, z.B. während Hot Reload)
const defaultImpersonationValue: UseImpersonationReturn = {
  isImpersonating: false,
  session: null,
  loading: false,
  remainingMinutes: 0,
  startImpersonation: async () => false,
  endImpersonation: async () => false,
  extendSession: async () => false,
  logAction: async () => {},
  refreshSession: async () => {},
};

export function useImpersonationContext(): UseImpersonationReturn {
  const context = useContext(ImpersonationContext);
  
  // Fallback für Hot Reload oder wenn Provider fehlt
  if (!context) {
    console.warn('useImpersonationContext: Provider not found, using default values');
    return defaultImpersonationValue;
  }
  
  return context;
}
