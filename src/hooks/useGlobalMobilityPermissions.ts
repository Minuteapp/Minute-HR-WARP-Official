import { useUserRole } from "./useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useRolePreview } from "./useRolePreview";

export interface GlobalMobilityPermissions {
  canViewExecutive: boolean;
  canViewCases: boolean;
  canViewEmployees: boolean;
  canViewVisa: boolean;
  canViewRelocation: boolean;
  canViewCosts: boolean;
  canViewRisks: boolean;
  canViewDocuments: boolean;
  canViewReports: boolean;
  canViewArchive: boolean;
  canCreateCase: boolean;
}

type RoleType = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'finance_controller' | 'manager' | 'team_lead' | 'employee';

const permissionMatrix: Record<RoleType, GlobalMobilityPermissions> = {
  superadmin: {
    canViewExecutive: true,
    canViewCases: true,
    canViewEmployees: true,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: true,
    canViewRisks: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewArchive: true,
    canCreateCase: true,
  },
  admin: {
    canViewExecutive: true,
    canViewCases: true,
    canViewEmployees: true,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: true,
    canViewRisks: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewArchive: true,
    canCreateCase: true,
  },
  hr: {
    canViewExecutive: true,
    canViewCases: true,
    canViewEmployees: true,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: true,
    canViewRisks: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewArchive: true,
    canCreateCase: true,
  },
  hr_admin: {
    canViewExecutive: true,
    canViewCases: true,
    canViewEmployees: true,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: true,
    canViewRisks: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewArchive: true,
    canCreateCase: true,
  },
  finance_controller: {
    canViewExecutive: true,
    canViewCases: true,
    canViewEmployees: false,
    canViewVisa: false,
    canViewRelocation: false,
    canViewCosts: true,
    canViewRisks: true,
    canViewDocuments: true,
    canViewReports: true,
    canViewArchive: true,
    canCreateCase: false,
  },
  manager: {
    canViewExecutive: false,
    canViewCases: true,
    canViewEmployees: true,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: false,
    canViewRisks: false,
    canViewDocuments: true,
    canViewReports: false,
    canViewArchive: true,
    canCreateCase: true,
  },
  team_lead: {
    canViewExecutive: false,
    canViewCases: true,
    canViewEmployees: false,
    canViewVisa: false,
    canViewRelocation: false,
    canViewCosts: false,
    canViewRisks: false,
    canViewDocuments: true,
    canViewReports: false,
    canViewArchive: true,
    canCreateCase: false,
  },
  employee: {
    canViewExecutive: false,
    canViewCases: true,
    canViewEmployees: false,
    canViewVisa: true,
    canViewRelocation: true,
    canViewCosts: false,
    canViewRisks: false,
    canViewDocuments: true,
    canViewReports: false,
    canViewArchive: true,
    canCreateCase: false,
  },
};

export const useGlobalMobilityPermissions = (): GlobalMobilityPermissions => {
  const { roles, hasRole, isHRAdmin, isManager } = useUserRole();
  const { session } = useAuth();
  const { previewRole, isPreviewActive } = useRolePreview();

  // Bestimme effektive Rolle basierend auf Preview oder tatsächlicher Rolle
  const getEffectiveRole = (): RoleType => {
    if (isPreviewActive && previewRole) {
      return previewRole as RoleType;
    }
    
    // Prüfe Rollen in Prioritätsreihenfolge
    if (hasRole('superadmin')) return 'superadmin';
    if (hasRole('admin')) return 'admin';
    if (hasRole('hr_admin')) return 'hr_admin';
    if (hasRole('team_lead')) return 'team_lead';
    return 'employee';
  };

  const role = getEffectiveRole();
  
  return permissionMatrix[role] || permissionMatrix.employee;
};
