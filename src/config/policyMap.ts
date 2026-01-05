// Zentrale RBAC-Policy-Definition für die App (Pilot: employees, absence, dashboard)
// Keine Design-Änderungen – dient nur als Datenquelle für Berechtigungsprüfungen

export type FieldVisibility = 'full' | 'limited' | 'aggregated' | 'masked' | 'none' | 'own_only';

export interface RolePolicy {
  scope: 'global' | 'standort' | 'abteilung' | 'team' | 'self';
  actions: string[]; // generische Default-Aktionen pro Rolle
  fields: Record<string, FieldVisibility>; // Tag -> Sichtbarkeit
}

export interface ModulePolicyByRole {
  [role: string]: {
    actions: string[]; // erlaubte Aktionen in DIESEM Modul
  };
}

export interface PolicyMap {
  roles: Record<string, RolePolicy>;
  modules: Record<string, ModulePolicyByRole>;
}

// Hinweis zu Modul-Keys:
// Diese sollten zu den in der App verwendeten Module-Keys passen.
// Für den Pilot wurden folgende Keys angenommen: 'dashboard', 'employees', 'absence'.

export const policyMap: PolicyMap = {
  roles: {
    Admin: {
      scope: 'global',
      actions: ['read', 'create', 'update', 'delete', 'approve', 'export', 'impersonate'],
      fields: { '*': 'full' },
    },
    'HR-Manager': {
      scope: 'global',
      actions: ['read', 'create', 'update', 'approve', 'export'],
      fields: { PII: 'full', PAYROLL: 'full', MEDICAL: 'restricted' as FieldVisibility },
    },
    Manager: {
      scope: 'abteilung',
      actions: ['read', 'approve', 'update'],
      fields: { PAYROLL: 'aggregated', PII: 'limited', MEDICAL: 'none' },
    },
    Teamleiter: {
      scope: 'team',
      actions: ['read', 'approve'],
      fields: { PAYROLL: 'none', PII: 'limited', MEDICAL: 'none' },
    },
    Payroll: {
      scope: 'global',
      actions: ['read', 'export', 'update'],
      fields: { PAYROLL: 'full', PII: 'limited', MEDICAL: 'none' },
    },
    Recruiter: {
      scope: 'global',
      actions: ['read', 'create', 'update', 'export'],
      fields: { PII: 'limited', PAYROLL: 'none', MEDICAL: 'none' },
    },
    Employee: {
      scope: 'self',
      actions: ['read', 'create', 'update'],
      fields: { '*': 'own_only' },
    },
    Auditor: {
      scope: 'global',
      actions: ['read', 'export'],
      fields: { PII: 'masked', PAYROLL: 'masked', MEDICAL: 'masked' },
    },
    'IT-Admin': {
      scope: 'global',
      actions: ['read', 'update', 'export'],
      fields: { PII: 'none', PAYROLL: 'none', MEDICAL: 'none' },
    },
    'Trainer': {
      scope: 'global',
      actions: ['read', 'create', 'update'],
      fields: { PII: 'limited', PAYROLL: 'none', MEDICAL: 'none' },
    },
    'Standort-Manager': {
      scope: 'standort',
      actions: ['read', 'approve', 'update'],
      fields: { PII: 'limited', PAYROLL: 'aggregated', MEDICAL: 'none' },
    },
  },
  modules: {
    dashboard: {
      Admin: { actions: ['read'] },
      'HR-Manager': { actions: ['read'] },
      Manager: { actions: ['read'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read'] },
      Recruiter: { actions: ['read'] },
      Employee: { actions: ['read'] },
      Auditor: { actions: ['read'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read'] },
    },
    employees: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'export'] },
      Manager: { actions: ['read', 'update'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read', 'export'] },
      Recruiter: { actions: ['read'] },
      Employee: { actions: [] }, // Kein Zugriff für normale Mitarbeiter!
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'update'] },
    },
    profil: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'export'] },
      Manager: { actions: ['read', 'update'] },
      Teamleiter: { actions: ['read'] },
      Employee: { actions: ['read', 'update'] }, // nur eigenes Profil
      Payroll: { actions: ['read'] },
      Recruiter: { actions: ['read'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'update'] },
    },
    absence: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'approve', 'update'] },
      Teamleiter: { actions: ['read', 'approve'] },
      Payroll: { actions: ['read', 'export'] },
      Recruiter: { actions: ['read'] },
      Employee: { actions: ['read', 'create', 'update'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'approve', 'update'] },
    },
    recruiting: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'approve'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: [] },
      Recruiter: { actions: ['read', 'create', 'update', 'export'] },
      Employee: { actions: [] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: [] },
      'Standort-Manager': { actions: ['read', 'approve'] },
    },
    performance: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'update', 'approve'] },
      Teamleiter: { actions: ['read', 'update'] },
      Payroll: { actions: ['read'] },
      Recruiter: { actions: [] },
      Employee: { actions: ['read', 'create', 'update'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'update', 'approve'] },
    },
    projects: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'export'] },
      Manager: { actions: ['read', 'create', 'update', 'approve'] },
      Teamleiter: { actions: ['read', 'create', 'update'] },
      Payroll: { actions: ['read'] },
      Recruiter: { actions: [] },
      Employee: { actions: ['read', 'update'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'create', 'update'] },
    },
    shift_planning: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'create', 'update', 'approve'] },
      Teamleiter: { actions: ['read', 'create', 'update'] },
      Payroll: { actions: ['read', 'export'] },
      Recruiter: { actions: [] },
      Employee: { actions: ['read'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: [] },
      'Standort-Manager': { actions: ['read', 'create', 'update', 'approve'] },
    },
    compliance: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'update'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read'] },
      Recruiter: { actions: ['read'] },
      Employee: { actions: ['read'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read', 'update'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'update'] },
    },
    reports: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'export'] },
      Manager: { actions: ['read', 'export'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read', 'export'] },
      Recruiter: { actions: ['read'] },
      Employee: { actions: [] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'export'] },
    },
    benefits: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'approve', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'approve', 'export'] },
      Manager: { actions: ['read', 'approve'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read', 'export'] },
      Recruiter: { actions: [] },
      Employee: { actions: ['read'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'approve'] },
    },
    sustainability: {
      Admin: { actions: ['read', 'create', 'update', 'delete', 'export'] },
      'HR-Manager': { actions: ['read', 'create', 'update', 'export'] },
      Manager: { actions: ['read', 'update'] },
      Teamleiter: { actions: ['read'] },
      Payroll: { actions: ['read'] },
      Recruiter: { actions: [] },
      Employee: { actions: ['read'] },
      Auditor: { actions: ['read', 'export'] },
      'IT-Admin': { actions: ['read'] },
      Trainer: { actions: ['read'] },
      'Standort-Manager': { actions: ['read', 'update'] },
    },
  },
};

export type PolicyRole = keyof typeof policyMap.roles;
export type PolicyModule = keyof typeof policyMap.modules;

export default policyMap;
