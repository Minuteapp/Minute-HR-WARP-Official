export interface RewardSettings {
  id: string;
  company_id?: string;
  module_name: string;
  module_description: string;
  is_module_active: boolean;
  is_peer_recognition_active: boolean;
  yearly_budget: number;
  max_reward_per_employee_monthly: number;
  team_lead_approval_threshold: number;
  budget_warning_enabled: boolean;
  budget_warning_threshold: number;
  auto_sync_enabled: boolean;
  default_payment_type: string;
  payout_timing: string;
  tax_optimization_enabled: boolean;
  email_notification_enabled: boolean;
  // Benachrichtigungen
  notify_new_reward: boolean;
  notify_approval_required: boolean;
  notify_budget_warning: boolean;
  notify_monthly_reports: boolean;
  // Automatisierung
  ai_recommendations_enabled: boolean;
  auto_approval_enabled: boolean;
  auto_approval_threshold: number;
  ai_confidence_threshold: number;
  // Lokalisierung
  default_language: string;
  default_currency: string;
  tax_region: string;
  gdpr_compliance_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardIntegration {
  id: string;
  company_id?: string;
  integration_name: string;
  integration_type: string;
  integration_description?: string;
  is_connected: boolean;
  connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RewardPermission {
  id: string;
  company_id?: string;
  role: string;
  can_view: boolean;
  can_create: boolean;
  can_approve: boolean;
  can_manage: boolean;
  created_at: string;
  updated_at: string;
}

export type SettingsCategory = 
  | 'general'
  | 'permissions'
  | 'budget'
  | 'payroll'
  | 'notifications'
  | 'integrations'
  | 'automation'
  | 'localization';

export const settingsCategoryLabels: Record<SettingsCategory, string> = {
  general: 'Allgemeine Einstellungen',
  permissions: 'Berechtigungen',
  budget: 'Budget-Regeln',
  payroll: 'Lohn-Integration',
  notifications: 'Benachrichtigungen',
  integrations: 'Integrationen',
  automation: 'Automatisierung',
  localization: 'Lokalisierung',
};

export const defaultRoles = [
  'Administrator',
  'HR-Manager',
  'Teamleiter',
  'Mitarbeiter',
];

export const payrollWorkflowSteps = [
  { 
    step: 1, 
    title: 'Belohnung wird genehmigt', 
    description: 'Belohnung wurde im System genehmigt',
    details: ['Genehmigung durch Vorgesetzten', 'Budget-Prüfung', 'Dokumentation']
  },
  { 
    step: 2, 
    title: 'Steuerliche Klassifizierung', 
    description: 'Belohnung wird steuerlich eingeordnet',
    details: ['Sachbezug (bis €50/Monat steuerfrei)', 'Geldwerter Vorteil', 'Gehaltsbestandteil']
  },
  { 
    step: 3, 
    title: 'Automatische Synchronisation', 
    description: 'Daten werden ans Lohnsystem übertragen',
    details: ['Lohnart wird zugewiesen', 'Zeitraum wird erfasst', 'Betrag wird übermittelt', 'Begründung wird dokumentiert']
  },
  { 
    step: 4, 
    title: 'Gehaltsabrechnung', 
    description: 'Verarbeitung im Lohnsystem',
    details: ['Auszahlung mit nächstem Gehalt', 'Korrekte Versteuerung', 'Ausweisung auf Lohnzettel', 'Statistik-Erfassung']
  },
  { 
    step: 5, 
    title: 'Bestätigung & Dokumentation', 
    description: 'Abschluss und Archivierung',
    details: ['Status-Update im System', 'Benachrichtigung an Mitarbeiter', 'Audit-Trail erstellt', 'Archivierung abgeschlossen']
  },
];
