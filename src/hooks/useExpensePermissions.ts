import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';
import { useRolePreview } from './useRolePreview';

export type ExpenseUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'team_lead' | 'employee' | 'finance_controller';

export interface ExpensePermissions {
  canViewOverview: boolean;
  canViewMyExpenses: boolean;
  canViewTeamExpenses: boolean;
  canViewCorporateCards: boolean;
  canViewApprovals: boolean;
  canViewPolicies: boolean;
  canEditPolicies: boolean;
  canViewBilling: boolean;
  canViewAnalytics: boolean;
  canViewArchive: boolean;
  canViewSettings: boolean;
}

// Berechtigungsmatrix für alle Rollen
const EXPENSE_ROLE_PERMISSIONS: Record<ExpenseUserRole, ExpensePermissions> = {
  superadmin: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: true,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: true,
    canViewBilling: true,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: true,
  },
  admin: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: true,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: true,
    canViewBilling: true,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: true,
  },
  hr: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: true,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: true,
    canViewBilling: true,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: false,
  },
  hr_admin: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: true,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: true,
    canViewBilling: true,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: false,
  },
  finance_controller: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: true,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: true,
    canViewBilling: true,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: false,
  },
  manager: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: false,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: false,
    canViewBilling: false,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: false,
  },
  team_lead: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: true,
    canViewCorporateCards: false,
    canViewApprovals: true,
    canViewPolicies: true,
    canEditPolicies: false,
    canViewBilling: false,
    canViewAnalytics: true,
    canViewArchive: true,
    canViewSettings: false,
  },
  employee: {
    canViewOverview: true,
    canViewMyExpenses: true,
    canViewTeamExpenses: false,
    canViewCorporateCards: false,
    canViewApprovals: false,
    canViewPolicies: true,
    canEditPolicies: false,
    canViewBilling: false,
    canViewAnalytics: false,
    canViewArchive: true,
    canViewSettings: false,
  },
};

// Default-Permissions für unbekannte Rollen (restriktiv wie employee)
const DEFAULT_PERMISSIONS: ExpensePermissions = {
  canViewOverview: true,
  canViewMyExpenses: true,
  canViewTeamExpenses: false,
  canViewCorporateCards: false,
  canViewApprovals: false,
  canViewPolicies: true,
  canEditPolicies: false,
  canViewBilling: false,
  canViewAnalytics: false,
  canViewArchive: true,
  canViewSettings: false,
};

export function useExpensePermissions() {
  const { roles, isLoading: roleLoading } = useUserRole();
  const { user, loading: authLoading } = useAuth();
  const { previewRole, isPreviewActive } = useRolePreview();

  const isLoading = roleLoading || authLoading;

  // Höchste Rolle des Benutzers ermitteln (Priorität)
  const roleHierarchy: ExpenseUserRole[] = [
    'superadmin', 
    'admin', 
    'hr', 
    'hr_admin', 
    'finance_controller', 
    'manager', 
    'team_lead', 
    'employee'
  ];
  
  // Wenn Preview aktiv → previewRole nutzen, sonst höchste echte Rolle
  const currentRole: ExpenseUserRole = isPreviewActive && previewRole
    ? (previewRole as ExpenseUserRole)
    : roleHierarchy.find(r => roles.some(userRole => userRole.role === r)) || 'employee';
  
  // Berechtigungen für die aktuelle Rolle abrufen
  const permissions = EXPENSE_ROLE_PERMISSIONS[currentRole] || DEFAULT_PERMISSIONS;

  return {
    permissions,
    currentRole,
    isLoading,
    userId: user?.id,
    // Direkte Berechtigungsprüfungen
    canViewOverview: permissions.canViewOverview,
    canViewMyExpenses: permissions.canViewMyExpenses,
    canViewTeamExpenses: permissions.canViewTeamExpenses,
    canViewCorporateCards: permissions.canViewCorporateCards,
    canViewApprovals: permissions.canViewApprovals,
    canViewPolicies: permissions.canViewPolicies,
    canEditPolicies: permissions.canEditPolicies,
    canViewBilling: permissions.canViewBilling,
    canViewAnalytics: permissions.canViewAnalytics,
    canViewArchive: permissions.canViewArchive,
    canViewSettings: permissions.canViewSettings,
  };
}

// Export der Konstanten für Tests und andere Verwendungen
export { EXPENSE_ROLE_PERMISSIONS };
