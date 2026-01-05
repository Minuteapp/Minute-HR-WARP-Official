export interface PredefinedWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  workflow_type: string;
  trigger: {
    type: string;
    condition: string;
    target_module?: string;
  };
  actions: Array<{
    type: string;
    description: string;
    target_module: string;
    config: Record<string, any>;
  }>;
  approval_steps: Array<{
    step: number;
    type: string;
    approver_role: string;
    description: string;
    conditions?: any;
  }>;
  conditions: Record<string, any>;
  auto_approval_rules: Array<any>;
  notification_settings: {
    send_confirmation: boolean;
    send_reminders: boolean;
    reminder_hours: number[];
  };
  tags: string[];
  icon: string;
}

export const predefinedWorkflowTemplates: PredefinedWorkflowTemplate[] = [
  // 👨‍💼 Mitarbeiter-Lifecycle
  {
    id: 'onboarding-automation',
    name: 'Onboarding-Automatisierung',
    description: 'Automatisiert den gesamten Onboarding-Prozess für neue Mitarbeiter',
    category: 'Mitarbeiter-Lifecycle',
    workflow_type: 'employee_onboarding',
    trigger: {
      type: 'employee_created',
      condition: 'new_employee_added',
      target_module: 'employees'
    },
    actions: [
      {
        type: 'create_account',
        description: 'Benutzerkonto erstellen',
        target_module: 'auth',
        config: { send_welcome_email: true }
      },
      {
        type: 'start_project',
        description: 'Onboarding-Projekt starten',
        target_module: 'projects',
        config: { template: 'onboarding_template' }
      },
      {
        type: 'send_email',
        description: 'Begrüßungsmail senden',
        target_module: 'communications',
        config: { template: 'welcome_email' }
      },
      {
        type: 'provide_documents',
        description: 'Dokumente bereitstellen (Arbeitsvertrag, Datenschutz)',
        target_module: 'documents',
        config: { document_types: ['contract', 'privacy_policy'] }
      },
      {
        type: 'schedule_meeting',
        description: 'Erstes Team-Meeting in Kalender eintragen',
        target_module: 'calendar',
        config: { meeting_type: 'team_introduction', duration: 60 }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Verarbeitung'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'always_auto_approve', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['automatisierung', 'mitarbeiter', 'onboarding'],
    icon: 'UserPlus'
  },
  {
    id: 'offboarding-automation',
    name: 'Offboarding-Automatisierung',
    description: 'Automatisiert den gesamten Offboarding-Prozess bei Kündigungen',
    category: 'Mitarbeiter-Lifecycle',
    workflow_type: 'employee_offboarding',
    trigger: {
      type: 'employee_terminated',
      condition: 'termination_entered',
      target_module: 'employees'
    },
    actions: [
      {
        type: 'revoke_access',
        description: 'Zugänge sperren',
        target_module: 'auth',
        config: { immediate: true }
      },
      {
        type: 'initiate_device_return',
        description: 'Geräte-Rückgabe einleiten',
        target_module: 'assets',
        config: { notify_admin: true }
      },
      {
        type: 'schedule_meeting',
        description: 'Abschlussgespräch planen',
        target_module: 'calendar',
        config: { meeting_type: 'exit_interview' }
      },
      {
        type: 'archive_tasks',
        description: 'Offene Aufgaben archivieren',
        target_module: 'tasks',
        config: { reassign_urgent: true }
      },
      {
        type: 'start_project',
        description: 'Wissenstransfer-Projekt starten',
        target_module: 'projects',
        config: { template: 'knowledge_transfer' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'hr',
        description: 'HR-Genehmigung für Offboarding'
      }
    ],
    conditions: {},
    auto_approval_rules: [],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24, 72]
    },
    tags: ['automatisierung', 'mitarbeiter', 'offboarding'],
    icon: 'UserMinus'
  },

  // 🧑‍⚕️ Abwesenheiten & Gesundheit
  {
    id: 'sick-leave-automation',
    name: 'Krankmeldung automatisch verarbeiten',
    description: 'Verarbeitet Krankmeldungen automatisch inkl. QR-Code-Erkennung',
    category: 'Abwesenheiten & Gesundheit',
    workflow_type: 'sick_leave_processing',
    trigger: {
      type: 'document_uploaded',
      condition: 'sick_note_uploaded',
      target_module: 'documents'
    },
    actions: [
      {
        type: 'extract_data',
        description: 'QR-Code-Erkennung und Datenextraktion',
        target_module: 'ai',
        config: { ocr_enabled: true, qr_recognition: true }
      },
      {
        type: 'create_absence',
        description: 'Abwesenheit eintragen',
        target_module: 'absences',
        config: { auto_approve: true }
      },
      {
        type: 'notify_manager',
        description: 'Teamleiter informieren',
        target_module: 'communications',
        config: { priority: 'high' }
      },
      {
        type: 'adjust_payroll',
        description: 'Gehaltsabrechnung anpassen',
        target_module: 'payroll',
        config: { sick_pay_calculation: true }
      },
      {
        type: 'find_replacement',
        description: 'Vertretung automatisch aus Schichtplanung ziehen',
        target_module: 'scheduling',
        config: { skills_matching: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Verarbeitung nach QR-Code-Validierung'
      }
    ],
    conditions: { qr_code_valid: true },
    auto_approval_rules: [{ condition: 'qr_code_valid', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['automatisierung', 'krankmeldung', 'qr-code', 'ki'],
    icon: 'Heart'
  },
  {
    id: 'vacation-approval',
    name: 'Urlaubsantrag genehmigen & eintragen',
    description: 'Genehmigungsprozess für Urlaubsanträge mit automatischer Kalender- und Projektanpassung',
    category: 'Abwesenheiten & Gesundheit',
    workflow_type: 'vacation_approval',
    trigger: {
      type: 'vacation_request',
      condition: 'request_submitted',
      target_module: 'absences'
    },
    actions: [
      {
        type: 'start_approval',
        description: 'Genehmigungsprozess starten',
        target_module: 'approvals',
        config: { escalation_days: 3 }
      },
      {
        type: 'block_calendar',
        description: 'Kalender blocken',
        target_module: 'calendar',
        config: { block_type: 'vacation' }
      },
      {
        type: 'create_absence',
        description: 'Abwesenheit eintragen (nach Genehmigung)',
        target_module: 'absences',
        config: { conditional: 'approved' }
      },
      {
        type: 'adjust_projects',
        description: 'Projekte & Roadmap automatisch anpassen',
        target_module: 'projects',
        config: { reschedule_tasks: true, notify_team: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'manager',
        description: 'Genehmigung durch direkten Vorgesetzten'
      },
      {
        step: 2,
        type: 'notification',
        approver_role: 'hr',
        description: 'Information an HR'
      }
    ],
    conditions: { vacation_days_available: true },
    auto_approval_rules: [
      { condition: 'days_less_than_5_and_coverage_available', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24, 72]
    },
    tags: ['urlaub', 'genehmigung', 'automatisierung'],
    icon: 'Calendar'
  },

  // 🕒 Zeiterfassung & Schichtplanung
  {
    id: 'automatic-shift-planning',
    name: 'Automatische Schichtplanung mit Skills',
    description: 'Erstellt automatisch optimierte Schichtpläne basierend auf Mitarbeiter-Skills',
    category: 'Zeiterfassung & Schichtplanung',
    workflow_type: 'shift_planning',
    trigger: {
      type: 'schedule_created',
      condition: 'new_shift_plan',
      target_module: 'scheduling'
    },
    actions: [
      {
        type: 'analyze_requirements',
        description: 'Schichtanforderungen analysieren',
        target_module: 'ai',
        config: { skill_matching: true }
      },
      {
        type: 'assign_employees',
        description: 'Mitarbeiter mit passenden Skills zuordnen',
        target_module: 'scheduling',
        config: { optimization_algorithm: 'genetic' }
      },
      {
        type: 'calculate_replacements',
        description: 'Ersatz bei Ausfall berechnen',
        target_module: 'scheduling',
        config: { backup_assignments: 2 }
      },
      {
        type: 'sync_time_tracking',
        description: 'Zeiterfassung automatisch synchronisieren',
        target_module: 'time_tracking',
        config: { auto_clock_in: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'manager',
        description: 'Bestätigung des generierten Schichtplans'
      }
    ],
    conditions: { employees_available: true },
    auto_approval_rules: [
      { condition: 'all_shifts_covered_and_no_conflicts', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [48]
    },
    tags: ['schichtplanung', 'ki', 'optimierung', 'skills'],
    icon: 'Clock'
  },
  {
    id: 'overtime-compensation',
    name: 'Überstunden-Ausgleich',
    description: 'Automatische Behandlung von Überstunden und Freizeitausgleich',
    category: 'Zeiterfassung & Schichtplanung',
    workflow_type: 'overtime_management',
    trigger: {
      type: 'overtime_threshold',
      condition: 'weekly_hours_exceeded',
      target_module: 'time_tracking'
    },
    actions: [
      {
        type: 'notify_manager',
        description: 'Führungskraft benachrichtigen',
        target_module: 'communications',
        config: { priority: 'medium', include_summary: true }
      },
      {
        type: 'schedule_time_off',
        description: 'Automatisch Freizeitausgleich in Kalender eintragen',
        target_module: 'calendar',
        config: { suggest_dates: true, prefer_monday_friday: false }
      },
      {
        type: 'update_balance',
        description: 'Überstunden-Saldo aktualisieren',
        target_module: 'time_tracking',
        config: { calculation_method: 'automatic' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'notification',
        approver_role: 'manager',
        description: 'Information über Überstunden'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'employee',
        description: 'Bestätigung der Freizeitausgleich-Termine'
      }
    ],
    conditions: { overtime_threshold: 40 },
    auto_approval_rules: [],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24]
    },
    tags: ['überstunden', 'freizeitausgleich', 'automatisierung'],
    icon: 'Timer'
  },

  // 💼 Projekte, Aufgaben & Roadmap
  {
    id: 'project-start-workflow',
    name: 'Projektstart-Workflow',
    description: 'Automatisiert den Projektstart mit Roadmap, Aufgaben und Team-Zuordnung',
    category: 'Projekte, Aufgaben & Roadmap',
    workflow_type: 'project_initialization',
    trigger: {
      type: 'project_created',
      condition: 'new_project_added',
      target_module: 'projects'
    },
    actions: [
      {
        type: 'create_roadmap',
        description: 'Roadmap erstellen',
        target_module: 'roadmaps',
        config: { template_based: true }
      },
      {
        type: 'generate_tasks',
        description: 'Aufgaben generieren',
        target_module: 'tasks',
        config: { ai_generated: true, priority_assignment: true }
      },
      {
        type: 'assign_team',
        description: 'Team zuordnen',
        target_module: 'projects',
        config: { skill_matching: true }
      },
      {
        type: 'setup_budget_control',
        description: 'Budgetkontrolle starten',
        target_module: 'finance',
        config: { monitoring_threshold: 80 }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'manager',
        description: 'Projektstart-Genehmigung'
      }
    ],
    conditions: { budget_approved: true },
    auto_approval_rules: [
      { condition: 'budget_under_10k_and_team_assigned', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24]
    },
    tags: ['projekt', 'start', 'automatisierung', 'roadmap'],
    icon: 'Rocket'
  },
  {
    id: 'task-escalation',
    name: 'Aufgaben-Eskalation',
    description: 'Eskaliert überfällige Aufgaben automatisch an Vorgesetzte',
    category: 'Projekte, Aufgaben & Roadmap',
    workflow_type: 'task_escalation',
    trigger: {
      type: 'task_overdue',
      condition: 'deadline_exceeded',
      target_module: 'tasks'
    },
    actions: [
      {
        type: 'notify_manager',
        description: 'Teamleiter informieren',
        target_module: 'communications',
        config: { priority: 'high', include_task_details: true }
      },
      {
        type: 'increase_priority',
        description: 'Priorität erhöhen',
        target_module: 'tasks',
        config: { new_priority: 'urgent' }
      },
      {
        type: 'send_chat_reminder',
        description: 'Automatische Erinnerung im Chat senden',
        target_module: 'communications',
        config: { channel: 'team_chat', mention_user: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Eskalation'
      }
    ],
    conditions: { days_overdue: 1 },
    auto_approval_rules: [{ condition: 'always_escalate', value: true }],
    notification_settings: {
      send_confirmation: false,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['aufgaben', 'eskalation', 'überfällig'],
    icon: 'AlertTriangle'
  },
  {
    id: 'roadmap-update',
    name: 'Roadmap-Update',
    description: 'Aktualisiert automatisch Roadmaps bei Projektfortschritt',
    category: 'Projekte, Aufgaben & Roadmap',
    workflow_type: 'roadmap_sync',
    trigger: {
      type: 'project_phase_completed',
      condition: 'milestone_reached',
      target_module: 'projects'
    },
    actions: [
      {
        type: 'start_next_phase',
        description: 'Nächste Phase starten',
        target_module: 'projects',
        config: { auto_assign_tasks: true }
      },
      {
        type: 'update_dependencies',
        description: 'Abhängigkeiten aktualisieren',
        target_module: 'roadmaps',
        config: { cascade_updates: true }
      },
      {
        type: 'report_status',
        description: 'Projektstatus an Dashboard melden',
        target_module: 'dashboard',
        config: { update_metrics: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatisches Roadmap-Update'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'milestone_validated', value: true }],    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['roadmap', 'automatisierung', 'projekt'],
    icon: 'Map'
  },

  // 📑 Dokumente & Compliance
  {
    id: 'document-management-gdpr',
    name: 'Dokumenten-Ablage DSGVO-konform',
    description: 'Automatische DSGVO-konforme Kategorisierung und Archivierung von Dokumenten',
    category: 'Dokumente & Compliance',
    workflow_type: 'document_processing',
    trigger: {
      type: 'document_uploaded',
      condition: 'new_document_added',
      target_module: 'documents'
    },
    actions: [
      {
        type: 'ai_categorization',
        description: 'Automatische Kategorisierung (Vertrag, Rechnung, Zertifikat)',
        target_module: 'ai',
        config: { classification_model: 'document_classifier' }
      },
      {
        type: 'gdpr_archiving',
        description: 'Archivierung nach DSGVO',
        target_module: 'documents',
        config: { retention_policy: 'auto', encryption: true }
      },
      {
        type: 'set_access_restrictions',
        description: 'Zugriffsbeschränkung setzen',
        target_module: 'security',
        config: { role_based_access: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische DSGVO-konforme Verarbeitung'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'classification_confidence_high', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['dokumente', 'dsgvo', 'ki', 'compliance'],
    icon: 'FileText'
  },
  {
    id: 'ai-invoice-processing',
    name: 'Rechnungsprüfung mit KI (Candis-Style)',
    description: 'KI-basierte Rechnungsprüfung mit automatischer Zahlungsfreigabe',
    category: 'Dokumente & Compliance',
    workflow_type: 'invoice_processing',
    trigger: {
      type: 'invoice_uploaded',
      condition: 'invoice_document_added',
      target_module: 'documents'
    },
    actions: [
      {
        type: 'ai_validation',
        description: 'KI prüft auf Vollständigkeit',
        target_module: 'ai',
        config: { validation_model: 'invoice_validator', check_completeness: true }
      },
      {
        type: 'update_budget',
        description: 'Budget-Modul aktualisieren',
        target_module: 'finance',
        config: { auto_categorization: true }
      },
      {
        type: 'payment_approval',
        description: 'Automatische Zahlungsfreigabe nach 2-Faktor-Check',
        target_module: 'finance',
        config: { two_factor_required: true, approval_limit: 1000 }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'KI-Validierung'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'finance',
        description: '2-Faktor-Genehmigung bei höheren Beträgen'
      }
    ],
    conditions: { invoice_valid: true },
    auto_approval_rules: [
      { condition: 'amount_under_1000_and_vendor_trusted', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24, 72]
    },
    tags: ['rechnung', 'ki', 'automatisierung', 'finance'],
    icon: 'Receipt'
  },

  // 🌍 Geschäftsreisen & Spesen
  {
    id: 'travel-request-approval',
    name: 'Reiseantrag genehmigen',
    description: 'Genehmigungsworkflow für Geschäftsreisen mit automatischer Kalenderbuchung',
    category: 'Geschäftsreisen & Spesen',
    workflow_type: 'travel_approval',
    trigger: {
      type: 'travel_request',
      condition: 'business_trip_requested',
      target_module: 'travel'
    },
    actions: [
      {
        type: 'hr_review',
        description: 'HR prüft Genehmigung',
        target_module: 'approvals',
        config: { check_policy_compliance: true }
      },
      {
        type: 'block_calendar',
        description: 'Kalender blocken',
        target_module: 'calendar',
        config: { block_type: 'business_travel' }
      },
      {
        type: 'create_travel_docs',
        description: 'Reiseunterlagen erstellen',
        target_module: 'documents',
        config: { auto_generate: true }
      },
      {
        type: 'reserve_budget',
        description: 'Reisebudget reservieren',
        target_module: 'finance',
        config: { budget_category: 'travel_expenses' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'manager',
        description: 'Vorgesetzten-Genehmigung'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'hr',
        description: 'HR-Genehmigung'
      }
    ],
    conditions: { budget_available: true },
    auto_approval_rules: [
      { condition: 'domestic_travel_under_500_euro', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [48, 24]
    },
    tags: ['reise', 'genehmigung', 'geschäftsreise'],
    icon: 'Plane'
  },
  {
    id: 'expense-automation',
    name: 'Spesenabrechnung automatisieren',
    description: 'Automatische Spesenverarbeitung mit QR-Code/Foto-Erkennung',
    category: 'Geschäftsreisen & Spesen',
    workflow_type: 'expense_processing',
    trigger: {
      type: 'receipt_uploaded',
      condition: 'receipt_document_added',
      target_module: 'documents'
    },
    actions: [
      {
        type: 'ai_extraction',
        description: 'KI liest Betrag & Kategorie aus',
        target_module: 'ai',
        config: { ocr_enabled: true, qr_recognition: true }
      },
      {
        type: 'create_expense_report',
        description: 'Abrechnung erstellen',
        target_module: 'finance',
        config: { auto_categorization: true }
      },
      {
        type: 'sync_accounting',
        description: 'Buchhaltung & Lohnabrechnung synchronisieren',
        target_module: 'payroll',
        config: { immediate_sync: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Verarbeitung nach KI-Validierung'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'manager',
        description: 'Genehmigung bei höheren Beträgen'
      }
    ],
    conditions: { receipt_valid: true },
    auto_approval_rules: [
      { condition: 'amount_under_50_euro_and_category_identified', value: true }
    ],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['spesen', 'automatisierung', 'ki', 'belege'],
    icon: 'CreditCard'
  },

  // 🌱 Nachhaltigkeit & Lieferketten
  {
    id: 'co2-reporting',
    name: 'CO₂-Reporting',
    description: 'Automatische monatliche CO₂-Bilanz aus allen Modulen',
    category: 'Nachhaltigkeit & Lieferketten',
    workflow_type: 'sustainability_reporting',
    trigger: {
      type: 'month_end',
      condition: 'monthly_trigger',
      target_module: 'scheduling'
    },
    actions: [
      {
        type: 'scan_modules',
        description: 'Alle Module (Reisen, Energie, Lieferketten) scannen',
        target_module: 'sustainability',
        config: { modules: ['travel', 'energy', 'supply_chain'] }
      },
      {
        type: 'calculate_co2',
        description: 'CO₂-Bilanz berechnen',
        target_module: 'sustainability',
        config: { calculation_method: 'ghg_protocol' }
      },
      {
        type: 'generate_report',
        description: 'Bericht automatisch ins Nachhaltigkeitsmodul exportieren',
        target_module: 'sustainability',
        config: { export_formats: ['pdf', 'eu_taxonomy'] }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Berichterstellung'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'monthly_schedule', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['nachhaltigkeit', 'co2', 'reporting', 'automatisierung'],
    icon: 'Leaf'
  },
  {
    id: 'supply-chain-monitoring',
    name: 'Lieferketten-Monitoring',
    description: 'Überwacht Lieferketten auf Störungen und berechnet Alternativen',
    category: 'Nachhaltigkeit & Lieferketten',
    workflow_type: 'supply_chain_monitoring',
    trigger: {
      type: 'supply_disruption',
      condition: 'disruption_detected',
      target_module: 'supply_chain'
    },
    actions: [
      {
        type: 'calculate_alternatives',
        description: 'KI berechnet alternative Lieferwege',
        target_module: 'ai',
        config: { optimization_model: 'supply_chain_optimizer' }
      },
      {
        type: 'notify_procurement',
        description: 'Einkauf benachrichtigen',
        target_module: 'communications',
        config: { priority: 'urgent', include_alternatives: true }
      },
      {
        type: 'calculate_co2_impact',
        description: 'CO₂-Auswirkungen darstellen',
        target_module: 'sustainability',
        config: { compare_alternatives: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Alternativen-Berechnung'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'procurement',
        description: 'Einkauf-Genehmigung für neue Lieferwege'
      }
    ],
    conditions: { disruption_severity: 'medium' },
    auto_approval_rules: [],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [2, 6]
    },
    tags: ['lieferkette', 'monitoring', 'ki', 'nachhaltigkeit'],
    icon: 'Truck'
  },

  // 💡 Innovation & Ideen
  {
    id: 'idea-submission-analysis',
    name: 'Idee einreichen & analysieren',
    description: 'KI-basierte Analyse eingereichte Ideen mit automatischem Tagging',
    category: 'Innovation & Ideen',
    workflow_type: 'idea_processing',
    trigger: {
      type: 'idea_submitted',
      condition: 'new_idea_added',
      target_module: 'innovation'
    },
    actions: [
      {
        type: 'ai_analysis',
        description: 'KI analysiert Idee',
        target_module: 'ai',
        config: { analysis_model: 'idea_classifier', sentiment_analysis: true }
      },
      {
        type: 'auto_tagging',
        description: 'Automatisch Tagging (Innovation/Produkt/HR)',
        target_module: 'innovation',
        config: { tag_categories: ['innovation', 'product', 'hr', 'process'] }
      },
      {
        type: 'create_decision_template',
        description: 'Entscheidungsvorlage ins Innovation Hub',
        target_module: 'innovation',
        config: { template: 'idea_evaluation' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'KI-Analyse und Kategorisierung'
      },
      {
        step: 2,
        type: 'approval',
        approver_role: 'innovation_manager',
        description: 'Bewertung durch Innovation Manager'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'quality_score_above_threshold', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [72, 168]
    },
    tags: ['innovation', 'ideen', 'ki', 'analyse'],
    icon: 'Lightbulb'
  },
  {
    id: 'idea-to-project-conversion',
    name: 'Idee → Projekt konvertieren',
    description: 'Konvertiert genehmigte Ideen automatisch in Projekte',
    category: 'Innovation & Ideen',
    workflow_type: 'idea_to_project',
    trigger: {
      type: 'idea_approved',
      condition: 'idea_status_approved',
      target_module: 'innovation'
    },
    actions: [
      {
        type: 'create_project',
        description: 'Neues Projekt anlegen',
        target_module: 'projects',
        config: { auto_populate_from_idea: true }
      },
      {
        type: 'start_roadmap',
        description: 'Roadmap starten',
        target_module: 'roadmaps',
        config: { template: 'innovation_roadmap' }
      },
      {
        type: 'generate_tasks',
        description: 'Erste Aufgaben generieren',
        target_module: 'tasks',
        config: { task_template: 'innovation_kickoff' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Projekt-Erstellung'
      }
    ],
    conditions: { idea_approved: true },
    auto_approval_rules: [{ condition: 'idea_approved', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['innovation', 'projekt', 'automatisierung'],
    icon: 'ArrowRight'
  },

  // 📢 Kommunikation & Helpdesk
  {
    id: 'hr-helpdesk-workflow',
    name: 'HR-Helpdesk Ticket → Workflow',
    description: 'Automatische Kategorisierung und Zuordnung von HR-Anfragen',
    category: 'Kommunikation & Helpdesk',
    workflow_type: 'helpdesk_processing',
    trigger: {
      type: 'hr_ticket_created',
      condition: 'new_hr_request',
      target_module: 'helpdesk'
    },
    actions: [
      {
        type: 'auto_categorize',
        description: 'Ticket automatisch kategorisieren',
        target_module: 'ai',
        config: { classification_model: 'ticket_classifier' }
      },
      {
        type: 'assign_team',
        description: 'Zuständigem Team zuordnen',
        target_module: 'helpdesk',
        config: { routing_rules: 'category_based' }
      },
      {
        type: 'set_deadline',
        description: 'Deadline setzen',
        target_module: 'helpdesk',
        config: { sla_rules: 'priority_based' }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Kategorisierung und Zuordnung'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'standard_hr_request', value: true }],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [24, 48]
    },
    tags: ['helpdesk', 'hr', 'automatisierung', 'ki'],
    icon: 'Headphones'
  },
  {
    id: 'automatic-notifications',
    name: 'Automatische Benachrichtigungen',
    description: 'Sendet automatische Updates bei Projekt- und Abwesenheitsänderungen',
    category: 'Kommunikation & Helpdesk',
    workflow_type: 'notification_system',
    trigger: {
      type: 'status_change',
      condition: 'project_or_absence_updated',
      target_module: 'multiple'
    },
    actions: [
      {
        type: 'send_push_notification',
        description: 'Push-Benachrichtigung im Chat',
        target_module: 'communications',
        config: { channels: ['app', 'web'] }
      },
      {
        type: 'send_email',
        description: 'E-Mail an Vorgesetzte',
        target_module: 'communications',
        config: { recipient_roles: ['manager', 'hr'] }
      },
      {
        type: 'update_dashboard',
        description: 'Update im Dashboard',
        target_module: 'dashboard',
        config: { real_time_update: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'automatic',
        approver_role: 'system',
        description: 'Automatische Benachrichtigungen'
      }
    ],
    conditions: {},
    auto_approval_rules: [{ condition: 'always_notify', value: true }],
    notification_settings: {
      send_confirmation: false,
      send_reminders: false,
      reminder_hours: []
    },
    tags: ['benachrichtigungen', 'automatisierung', 'kommunikation'],
    icon: 'Bell'
  },

  // 🤖 KI & Automatisierungen
  {
    id: 'ai-workflow-suggestions',
    name: 'KI schlägt Workflow vor',
    description: 'KI erkennt wiederkehrende Muster und schlägt neue Workflows vor',
    category: 'KI & Automatisierungen',
    workflow_type: 'ai_workflow_optimization',
    trigger: {
      type: 'pattern_detected',
      condition: 'recurring_pattern_identified',
      target_module: 'ai'
    },
    actions: [
      {
        type: 'analyze_pattern',
        description: 'Wiederkehrende Muster analysieren',
        target_module: 'ai',
        config: { pattern_recognition_model: 'workflow_optimizer' }
      },
      {
        type: 'generate_workflow_proposal',
        description: 'Vorschlag für neuen Workflow automatisch generieren',
        target_module: 'ai',
        config: { template_generation: true }
      },
      {
        type: 'request_admin_approval',
        description: 'Admin muss nur bestätigen',
        target_module: 'approvals',
        config: { priority: 'low', include_analysis: true }
      }
    ],
    approval_steps: [
      {
        step: 1,
        type: 'approval',
        approver_role: 'admin',
        description: 'Admin-Genehmigung für KI-Workflow-Vorschlag'
      }
    ],
    conditions: { pattern_confidence: 0.8 },
    auto_approval_rules: [],
    notification_settings: {
      send_confirmation: true,
      send_reminders: true,
      reminder_hours: [168]
    },
    tags: ['ki', 'automatisierung', 'optimierung', 'selbstlernend'],
    icon: 'Brain'
  }
];