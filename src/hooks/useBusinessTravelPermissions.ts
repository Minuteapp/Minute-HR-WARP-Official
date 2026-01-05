import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';
import { useRolePreview } from './useRolePreview';

export type TravelUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'team_lead' | 'employee' | 'finance_controller';

export interface BusinessTravelPermissions {
  canViewDashboard: boolean;
  canViewMyTrips: boolean;
  canViewTravelRequests: boolean;
  canViewExpenses: boolean;
  canViewExpenseCategories: boolean;
  canViewPerDiem: boolean;
  canViewMileage: boolean;
  canViewCompanyCards: boolean;
  canViewWorkflow: boolean;
  canViewIntegrations: boolean;
  canViewReporting: boolean;
  canViewTeamTravel: boolean;
  canViewRolesDemo: boolean;
  canViewAdmin: boolean;
}

const ROLE_PERMISSIONS: Record<TravelUserRole, BusinessTravelPermissions> = {
  superadmin: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: true,
    canViewPerDiem: true,
    canViewMileage: true,
    canViewCompanyCards: true,
    canViewWorkflow: true,
    canViewIntegrations: true,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: true,
    canViewAdmin: true,
  },
  admin: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: true,
    canViewPerDiem: true,
    canViewMileage: true,
    canViewCompanyCards: true,
    canViewWorkflow: true,
    canViewIntegrations: true,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: true,
    canViewAdmin: true,
  },
  hr: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: true,
    canViewPerDiem: true,
    canViewMileage: true,
    canViewCompanyCards: false,
    canViewWorkflow: true,
    canViewIntegrations: false,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: false,
    canViewAdmin: false,
  },
  hr_admin: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: true,
    canViewPerDiem: true,
    canViewMileage: true,
    canViewCompanyCards: true,
    canViewWorkflow: true,
    canViewIntegrations: true,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: true,
    canViewAdmin: true,
  },
  finance_controller: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: true,
    canViewPerDiem: true,
    canViewMileage: true,
    canViewCompanyCards: true,
    canViewWorkflow: true,
    canViewIntegrations: false,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: false,
    canViewAdmin: false,
  },
  manager: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: false,
    canViewPerDiem: false,
    canViewMileage: true,
    canViewCompanyCards: false,
    canViewWorkflow: false,
    canViewIntegrations: false,
    canViewReporting: true,
    canViewTeamTravel: true,
    canViewRolesDemo: false,
    canViewAdmin: false,
  },
  team_lead: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: false,
    canViewPerDiem: false,
    canViewMileage: true,
    canViewCompanyCards: false,
    canViewWorkflow: false,
    canViewIntegrations: false,
    canViewReporting: false,
    canViewTeamTravel: true,
    canViewRolesDemo: false,
    canViewAdmin: false,
  },
  employee: {
    canViewDashboard: true,
    canViewMyTrips: true,
    canViewTravelRequests: true,
    canViewExpenses: true,
    canViewExpenseCategories: false,
    canViewPerDiem: false,
    canViewMileage: true,
    canViewCompanyCards: false,
    canViewWorkflow: false,
    canViewIntegrations: false,
    canViewReporting: false,
    canViewTeamTravel: false,
    canViewRolesDemo: false,
    canViewAdmin: false,
  },
};

export function useBusinessTravelPermissions(): BusinessTravelPermissions & { currentRole: TravelUserRole; isLoading: boolean } {
  const { roles, isLoading: roleLoading } = useUserRole();
  const { user, loading: authLoading } = useAuth();
  const { previewRole, isPreviewActive } = useRolePreview();
  
  const isLoading = roleLoading || authLoading;
  
  // Rollenhierarchie
  const roleHierarchy: TravelUserRole[] = [
    'superadmin', 'admin', 'hr', 'hr_admin', 'finance_controller', 'manager', 'team_lead', 'employee'
  ];
  
  // Effektive Rolle ermitteln
  const currentRole: TravelUserRole = isPreviewActive && previewRole
    ? (previewRole as TravelUserRole)
    : roleHierarchy.find(r => roles.some(userRole => userRole.role === r)) || 'employee';
  
  const permissions = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.employee;
  
  return {
    ...permissions,
    currentRole,
    isLoading,
  };
}
