import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';
import { useRolePreview } from './useRolePreview';

export type DocumentUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'employee' | 'finance_controller';

export interface DocumentPermissions {
  canViewAll: boolean;
  canViewTeam: boolean;
  canViewOwn: boolean;
  canUpload: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canManagePermissions: boolean;
  canViewStats: boolean;
  canViewPendingApprovals: boolean;
  canViewExpiringDocuments: boolean;
}

// Berechtigungsmatrix für alle Rollen
const DOCUMENT_ROLE_PERMISSIONS: Record<DocumentUserRole, DocumentPermissions> = {
  superadmin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canManagePermissions: true,
    canViewStats: true,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  admin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canApprove: true,
    canManagePermissions: true,
    canViewStats: true,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  hr: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canApprove: true,
    canManagePermissions: false,
    canViewStats: true,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  hr_admin: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canApprove: true,
    canManagePermissions: false,
    canViewStats: true,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  finance_controller: {
    canViewAll: true,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canApprove: true,
    canManagePermissions: false,
    canViewStats: true,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  manager: {
    canViewAll: false,
    canViewTeam: true,
    canViewOwn: true,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canApprove: true,
    canManagePermissions: false,
    canViewStats: false,
    canViewPendingApprovals: true,
    canViewExpiringDocuments: true,
  },
  employee: {
    canViewAll: false,
    canViewTeam: false,
    canViewOwn: true,
    canUpload: true,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canManagePermissions: false,
    canViewStats: false,
    canViewPendingApprovals: false,
    canViewExpiringDocuments: false,
  },
};

// Default-Permissions für unbekannte Rollen
const DEFAULT_PERMISSIONS: DocumentPermissions = {
  canViewAll: false,
  canViewTeam: false,
  canViewOwn: true,
  canUpload: false,
  canEdit: false,
  canDelete: false,
  canApprove: false,
  canManagePermissions: false,
  canViewStats: false,
  canViewPendingApprovals: false,
  canViewExpiringDocuments: false,
};

export function useDocumentPermissions() {
  const { roles, isLoading: roleLoading } = useUserRole();
  const { user, loading: authLoading } = useAuth();
  const { previewRole, isPreviewActive } = useRolePreview();

  const isLoading = roleLoading || authLoading;

  // Höchste Rolle des Benutzers ermitteln (Priorität: superadmin > admin > hr > manager > employee)
  const roleHierarchy: DocumentUserRole[] = ['superadmin', 'admin', 'hr', 'hr_admin', 'finance_controller', 'manager', 'employee'];
  
  // Wenn Preview aktiv → previewRole nutzen, sonst höchste echte Rolle
  const currentRole: DocumentUserRole = isPreviewActive && previewRole
    ? (previewRole as DocumentUserRole)
    : roleHierarchy.find(r => roles.some(userRole => userRole.role === r)) || 'employee';
  
  // Berechtigungen für die aktuelle Rolle abrufen
  const permissions = DOCUMENT_ROLE_PERMISSIONS[currentRole] || DEFAULT_PERMISSIONS;

  // Hilfsfunktionen für spezifische Berechtigungsprüfungen
  const canViewDocument = (document: { created_by?: string; team_id?: string; shared_with?: string[] }) => {
    if (permissions.canViewAll) return true;
    if (permissions.canViewOwn && document.created_by === user?.id) return true;
    if (permissions.canViewTeam && document.team_id) {
      // TODO: Prüfen ob User im gleichen Team ist
      return true;
    }
    if (document.shared_with?.includes(user?.id || '')) return true;
    return false;
  };

  const canEditDocument = (document: { created_by?: string }) => {
    if (permissions.canEdit) return true;
    // Eigene Dokumente können immer bearbeitet werden
    if (document.created_by === user?.id) return true;
    return false;
  };

  const canDeleteDocument = (_document: { created_by?: string }) => {
    if (permissions.canDelete) return true;
    return false;
  };

  return {
    permissions,
    currentRole,
    isLoading,
    userId: user?.id,
    // Convenience-Methoden
    canViewDocument,
    canEditDocument,
    canDeleteDocument,
    // Direkte Berechtigungsprüfungen
    canViewAll: permissions.canViewAll,
    canUpload: permissions.canUpload,
    canApprove: permissions.canApprove,
    canManagePermissions: permissions.canManagePermissions,
    canViewStats: permissions.canViewStats,
    canViewPendingApprovals: permissions.canViewPendingApprovals,
    canViewExpiringDocuments: permissions.canViewExpiringDocuments,
  };
}

// Export der Konstanten für Tests und andere Verwendungen
export { DOCUMENT_ROLE_PERMISSIONS };
