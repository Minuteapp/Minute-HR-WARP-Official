import React, { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { RolePermissionMatrix } from '@/hooks/usePermissions';

interface PermissionContextType {
  hasPermission: (moduleKey: string, action: string, scope?: string) => boolean;
  roleMatrix: RolePermissionMatrix[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { hasPermission, roleMatrix, loading, error, reload } = usePermissions();

  return (
    <PermissionContext.Provider value={{ hasPermission, roleMatrix, loading, error, reload }}>
      {children}
    </PermissionContext.Provider>
  );
};