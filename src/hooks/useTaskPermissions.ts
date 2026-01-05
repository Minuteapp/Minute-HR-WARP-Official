import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';
import { useRolePreview } from './useRolePreview';

export type TaskUserRole = 'superadmin' | 'admin' | 'hr' | 'hr_admin' | 'manager' | 'team_lead' | 'employee' | 'finance_controller';

export interface TaskPermissions {
  canViewOverview: boolean;
  canViewTeamTasks: boolean;
  canViewProjects: boolean;
  canViewKanban: boolean;
  canViewGantt: boolean;
  canViewArchive: boolean;
  canCreateTask: boolean;
  canEditAllTasks: boolean;
}

const ROLE_PERMISSIONS: Record<TaskUserRole, TaskPermissions> = {
  superadmin: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: true,
  },
  admin: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: true,
  },
  hr: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: false,
  },
  hr_admin: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: true,
  },
  finance_controller: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: false,
  },
  manager: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: false,
  },
  team_lead: {
    canViewOverview: true,
    canViewTeamTasks: true,
    canViewProjects: true,
    canViewKanban: true,
    canViewGantt: true,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: false,
  },
  employee: {
    canViewOverview: true,
    canViewTeamTasks: false,
    canViewProjects: false,
    canViewKanban: true,
    canViewGantt: false,
    canViewArchive: true,
    canCreateTask: true,
    canEditAllTasks: false,
  },
};

export function useTaskPermissions(): TaskPermissions & { currentRole: TaskUserRole; isLoading: boolean } {
  const { roles, isLoading: roleLoading } = useUserRole();
  const { user, loading: authLoading } = useAuth();
  const { previewRole, isPreviewActive } = useRolePreview();
  
  const isLoading = roleLoading || authLoading;
  
  // Rollenhierarchie
  const roleHierarchy: TaskUserRole[] = [
    'superadmin', 'admin', 'hr', 'hr_admin', 'finance_controller', 'manager', 'team_lead', 'employee'
  ];
  
  // Effektive Rolle ermitteln
  const currentRole: TaskUserRole = isPreviewActive && previewRole
    ? (previewRole as TaskUserRole)
    : roleHierarchy.find(r => roles.some(userRole => userRole.role === r)) || 'employee';
  
  const permissions = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.employee;
  
  return {
    ...permissions,
    currentRole,
    isLoading,
  };
}
