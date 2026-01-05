/**
 * Rollenbasierte Berechtigungsmatrix für alle Settings-Module
 * Definiert welche Rolle welche Einstellungen sehen und bearbeiten kann
 */

export type SettingsRole = 'employee' | 'team_lead' | 'manager' | 'hr_manager' | 'admin' | 'superadmin';

export type SettingsScope = 'own' | 'team' | 'department' | 'global';

export interface SettingsModulePermission {
  moduleId: string;
  visibility: Record<SettingsRole, boolean>;
  canEdit: Record<SettingsRole, boolean>;
  scope: Record<SettingsRole, SettingsScope>;
}

/**
 * Zentrale Berechtigungsmatrix für alle 32 Settings-Module
 */
export const SETTINGS_MODULE_PERMISSIONS: Record<string, SettingsModulePermission> = {
  // ========================================
  // Organisation & Struktur
  // ========================================
  'company-info': {
    moduleId: 'company-info',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'orgchart': {
    moduleId: 'orgchart',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'users-roles': {
    moduleId: 'users-roles',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // Zeit & Anwesenheit
  // ========================================
  'timetracking': {
    moduleId: 'timetracking',
    visibility: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'absence': {
    moduleId: 'absence',
    visibility: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'calendar': {
    moduleId: 'calendar',
    visibility: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'shift-planning': {
    moduleId: 'shift-planning',
    visibility: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // Projekte & Aufgaben
  // ========================================
  'tasks': {
    moduleId: 'tasks',
    visibility: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'projects': {
    moduleId: 'projects',
    visibility: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'workflow': {
    moduleId: 'workflow',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // HR & Mitarbeiter
  // ========================================
  'recruiting': {
    moduleId: 'recruiting',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'onboarding': {
    moduleId: 'onboarding',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'offboarding': {
    moduleId: 'offboarding',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'performance': {
    moduleId: 'performance',
    visibility: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'training': {
    moduleId: 'training',
    visibility: { employee: false, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'team', manager: 'department', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'workforce-planning': {
    moduleId: 'workforce-planning',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // Finanzen & Reisen
  // ========================================
  'payroll': {
    moduleId: 'payroll',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'expenses': {
    moduleId: 'expenses',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'business-travel': {
    moduleId: 'business-travel',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'assets': {
    moduleId: 'assets',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // System & Integration
  // ========================================
  'dashboard': {
    moduleId: 'dashboard',
    visibility: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'global': {
    moduleId: 'global',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'own', admin: 'global', superadmin: 'global' },
  },
  'integrations': {
    moduleId: 'integrations',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'own', admin: 'global', superadmin: 'global' },
  },
  'security': {
    moduleId: 'security',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'own', admin: 'global', superadmin: 'global' },
  },
  'ai-automation': {
    moduleId: 'ai-automation',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: false, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'own', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // Wissen & Innovation
  // ========================================
  'knowledge': {
    moduleId: 'knowledge',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'innovation': {
    moduleId: 'innovation',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'helpdesk': {
    moduleId: 'helpdesk',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'rewards': {
    moduleId: 'rewards',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },

  // ========================================
  // Compliance & Dokumente
  // ========================================
  'documents': {
    moduleId: 'documents',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'notifications': {
    moduleId: 'notifications',
    visibility: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: true, team_lead: true, manager: true, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'compliance-dashboard': {
    moduleId: 'compliance-dashboard',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
  'global-mobility': {
    moduleId: 'global-mobility',
    visibility: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    canEdit: { employee: false, team_lead: false, manager: false, hr_manager: true, admin: true, superadmin: true },
    scope: { employee: 'own', team_lead: 'own', manager: 'own', hr_manager: 'global', admin: 'global', superadmin: 'global' },
  },
};

/**
 * Hilfsfunktion: Prüft ob eine Rolle höher als eine andere ist
 */
export function isHigherRole(role: SettingsRole, thanRole: SettingsRole): boolean {
  const hierarchy: SettingsRole[] = ['employee', 'team_lead', 'manager', 'hr_manager', 'admin', 'superadmin'];
  return hierarchy.indexOf(role) > hierarchy.indexOf(thanRole);
}

/**
 * Hilfsfunktion: Konvertiert effektive Rolle zu SettingsRole
 */
export function toSettingsRole(effectiveRole: string | undefined): SettingsRole {
  const validRoles: SettingsRole[] = ['employee', 'team_lead', 'manager', 'hr_manager', 'admin', 'superadmin'];
  if (effectiveRole && validRoles.includes(effectiveRole as SettingsRole)) {
    return effectiveRole as SettingsRole;
  }
  return 'employee';
}

/**
 * Liste aller Settings-Module für UI-Anzeige
 */
export const SETTINGS_MODULES_LIST = Object.keys(SETTINGS_MODULE_PERMISSIONS);
