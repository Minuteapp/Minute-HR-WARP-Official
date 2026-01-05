
import React, { useEffect } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/AuthContext';

interface WithPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 * @param permission The permission string to check
 * @param children Content to display if the user has permission
 * @param fallback Optional content to display if the user doesn't have permission
 */
export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission, isSuperAdmin } = useRolePermissions();
  const { user } = useAuth();
  
  // Verbessertes Debug-Logging
  useEffect(() => {
    console.log('WithPermission: hasPermission-Funktion verfügbar:', typeof hasPermission === 'function');
    console.log('WithPermission: Prüfe Berechtigung:', permission);
    console.log('WithPermission: isSuperAdmin:', isSuperAdmin);
    console.log('WithPermission: User:', user);
    if (user) {
      console.log('WithPermission: User E-Mail:', user.email);
      console.log('WithPermission: User Metadaten:', user.user_metadata);
    }
  }, [hasPermission, permission, isSuperAdmin, user]);
  
  // SuperAdmin hat immer Zugriff - Frühe Rückgabe für SuperAdmin
  if (isSuperAdmin) {
    console.log('WithPermission: SuperAdmin hat Zugriff');
    return <>{children}</>;
  }
  
  // If no user is logged in, show fallback
  if (!user) {
    console.log('WithPermission: Kein Benutzer angemeldet, zeige Fallback');
    return <>{fallback}</>;
  }
  
  // Sicherstellen, dass hasPermission eine Funktion ist
  const hasPermissionResult = typeof hasPermission === 'function' 
    ? hasPermission(permission)
    : false;
  
  console.log(`WithPermission: Berechtigungsprüfung für ${permission}:`, hasPermissionResult);
  
  if (hasPermissionResult) {
    return <>{children}</>;
  }
  
  // Fallback for users without permission
  console.log('WithPermission: Keine Berechtigung, zeige Fallback');
  return <>{fallback}</>;
};
