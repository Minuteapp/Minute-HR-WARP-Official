import { useSidebarPermissions, EffectiveRole } from './useSidebarPermissions';
import { useMemo } from 'react';

/**
 * Modul-spezifische Rollen für UI-Komponenten
 * Diese werden aus den Datenbank-Rollen abgeleitet
 */
export type ModuleRole = 'admin' | 'hr' | 'teamlead' | 'employee';

/**
 * Zentraler Hook zur Ermittlung der effektiven Benutzerrolle
 * für die rollenbasierte Ansichtssteuerung in Modulen.
 * 
 * Berücksichtigt:
 * - Tenant-Impersonation (Tunnel-Modus)
 * - Preview-Rollen für SuperAdmins
 * - Normale Benutzerrollen aus user_roles
 */
export const useEffectiveRole = () => {
  const { effectiveRole, loading } = useSidebarPermissions();

  // Mapping von DB-Rollen zu Modul-Rollen
  const moduleRole = useMemo((): ModuleRole => {
    if (!effectiveRole) return 'employee';
    
    const role = effectiveRole.toLowerCase();
    
    switch (role) {
      case 'superadmin':
      case 'admin':
        return 'admin';
      case 'hr_admin':
        return 'hr';
      case 'team_lead':
        return 'teamlead';
      case 'employee':
      default:
        return 'employee';
    }
  }, [effectiveRole]);

  // Convenience Flags für Berechtigungsprüfungen
  const isAdmin = effectiveRole === 'superadmin' || effectiveRole === 'admin';
  const isSuperAdmin = effectiveRole === 'superadmin';
  const isHR = effectiveRole === 'hr_admin';
  const isTeamlead = effectiveRole === 'team_lead';
  const isEmployee = !effectiveRole || effectiveRole === 'employee';
  
  // HR oder Admin (für Ansichten die HR-Rechte benötigen)
  const isHROrAdmin = isAdmin || isHR;
  
  // Teamlead oder höher (für Team-Übersichten)
  const isTeamleadOrHigher = isAdmin || isHR || isTeamlead;

  return {
    // Die gemappte Modul-Rolle (admin, hr, teamlead, employee)
    role: moduleRole,
    // Die rohe Rolle aus der Datenbank
    rawRole: effectiveRole,
    // Convenience Flags
    isAdmin,
    isSuperAdmin,
    isHR,
    isTeamlead,
    isEmployee,
    isHROrAdmin,
    isTeamleadOrHigher,
    // Loading State
    loading
  };
};

export default useEffectiveRole;
