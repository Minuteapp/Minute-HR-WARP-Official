import { useAuth } from '../useAuth';
import { useEffectiveRole } from '../useEffectiveRole';

export type SickLeaveUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'employee' | 'finance_controller';

export interface SickLeavePermissions {
  canViewAll: boolean;
  canViewTeam: boolean;
  canViewOwn: boolean;
  canCreate: boolean;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
  canExport: boolean;
  canViewStatistics: boolean;
  canViewTeamOverview: boolean;
  canManageSettings: boolean;
  canViewLiveMonitor: boolean;
}

// Berechtigungsmatrix für alle Rollen
const SICK_LEAVE_ROLE_PERMISSIONS: Record<SickLeaveUserRole, SickLeavePermissions> = {
  superadmin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: true,
    canReject: true,
    canDelete: true,
    canExport: true,
    canViewStatistics: true,
    canViewTeamOverview: true,
    canManageSettings: true,
    canViewLiveMonitor: true,
  },
  admin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: true,
    canReject: true,
    canDelete: true,
    canExport: true,
    canViewStatistics: true,
    canViewTeamOverview: true,
    canManageSettings: true,
    canViewLiveMonitor: true,
  },
  hr: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: true,
    canReject: true,
    canDelete: false,
    canExport: true,
    canViewStatistics: true,
    canViewTeamOverview: true,
    canManageSettings: true,
    canViewLiveMonitor: true,
  },
  hr_admin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: true,
    canReject: true,
    canDelete: false,
    canExport: true,
    canViewStatistics: true,
    canViewTeamOverview: true,
    canManageSettings: true,
    canViewLiveMonitor: true,
  },
  finance_controller: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: false,
    canReject: false,
    canDelete: false,
    canExport: true,
    canViewStatistics: true,
    canViewTeamOverview: true,
    canManageSettings: false,
    canViewLiveMonitor: true,
  },
  manager: {
    canViewAll: false,
    canViewTeam: true,
    canViewOwn: true,
    canCreate: true,
    canApprove: true,
    canReject: true,
    canDelete: false,
    canExport: true,
    canViewStatistics: false,
    canViewTeamOverview: true,
    canManageSettings: false,
    canViewLiveMonitor: true,
  },
  employee: {
    canViewAll: false,
    canViewTeam: false,
    canViewOwn: true,
    canCreate: true,
    canApprove: false,
    canReject: false,
    canDelete: false,
    canExport: false,
    canViewStatistics: false,
    canViewTeamOverview: false,
    canManageSettings: false,
    canViewLiveMonitor: false,
  },
};

// Default-Permissions für unbekannte Rollen
const DEFAULT_PERMISSIONS: SickLeavePermissions = {
  canViewAll: false,
  canViewTeam: false,
  canViewOwn: true,
  canCreate: true,
  canApprove: false,
  canReject: false,
  canDelete: false,
  canExport: false,
  canViewStatistics: false,
  canViewTeamOverview: false,
  canManageSettings: false,
  canViewLiveMonitor: false,
};

export function useSickLeavePermissions() {
  const { user, loading: authLoading } = useAuth();
  const { rawRole, isAdmin, isSuperAdmin, isHR, isTeamlead, loading: roleLoading } = useEffectiveRole();

  const isLoading = roleLoading || authLoading;

  // Mappe die effektive Rolle auf SickLeaveUserRole
  const mapToSickLeaveRole = (): SickLeaveUserRole => {
    if (!rawRole) return 'employee';
    
    const role = rawRole.toLowerCase();
    
    if (role === 'superadmin') return 'superadmin';
    if (role === 'admin') return 'admin';
    if (role === 'hr_admin' || role === 'hr') return 'hr_admin';
    if (role === 'team_lead') return 'manager';
    
    return 'employee';
  };

  const currentRole = mapToSickLeaveRole();
  
  // Berechtigungen für die aktuelle Rolle abrufen
  const permissions = SICK_LEAVE_ROLE_PERMISSIONS[currentRole] || DEFAULT_PERMISSIONS;

  // Rollenname für die Anzeige
  const getRoleDisplayName = (): string => {
    switch (currentRole) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'hr':
      case 'hr_admin': return 'HR Admin';
      case 'finance_controller': return 'Finance';
      case 'manager': return 'Teamleiter';
      default: return 'Mitarbeiter';
    }
  };

  // Hilfsfunktionen für spezifische Berechtigungsprüfungen
  const canViewSickLeave = (sickLeave: { user_id?: string; team_id?: string }) => {
    if (permissions.canViewAll) return true;
    if (permissions.canViewOwn && sickLeave.user_id === user?.id) return true;
    if (permissions.canViewTeam && sickLeave.team_id) {
      // TODO: Prüfen ob User im gleichen Team ist
      return true;
    }
    return false;
  };

  const canApproveSickLeave = (sickLeave: { user_id?: string }) => {
    if (!permissions.canApprove) return false;
    // Kann nicht eigene Krankmeldung genehmigen
    if (sickLeave.user_id === user?.id) return false;
    return true;
  };

  return {
    permissions,
    currentRole,
    roleDisplayName: getRoleDisplayName(),
    isLoading,
    userId: user?.id,
    // Convenience-Methoden
    canViewSickLeave,
    canApproveSickLeave,
    // Direkte Berechtigungsprüfungen
    canViewAll: permissions.canViewAll,
    canViewTeam: permissions.canViewTeam,
    canCreate: permissions.canCreate,
    canApprove: permissions.canApprove,
    canReject: permissions.canReject,
    canDelete: permissions.canDelete,
    canExport: permissions.canExport,
    canViewStatistics: permissions.canViewStatistics,
    canViewTeamOverview: permissions.canViewTeamOverview,
    canManageSettings: permissions.canManageSettings,
    canViewLiveMonitor: permissions.canViewLiveMonitor,
  };
}

// Export der Konstanten für Tests
export { SICK_LEAVE_ROLE_PERMISSIONS };
