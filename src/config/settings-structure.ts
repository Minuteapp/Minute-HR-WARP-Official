
import { 
  Settings, 
  Building2, 
  Shield, 
  Calendar, 
  Clock, 
  DollarSign, 
  Receipt, 
  Users, 
  Bell, 
  Plug, 
  FileCheck,
  BarChart3,
  ShieldCheck,
  Timer,
  LayoutDashboard,
  Globe,
  UserX,
  UserPlus,
  CheckSquare,
  FolderKanban,
  Headphones,
  CalendarDays,
  Wallet,
  Gift,
  UserCheck,
  GitBranch,
  Lightbulb,
  BookOpen,
  Plane,
  UsersRound,
  Briefcase,
  Network,
  Map
} from "lucide-react";

export const settingsStructure = [
  {
    id: "global",
    title: "Globale Einstellungen",
    icon: Globe,
    subcategories: [
      { id: "global-settings", title: "Globale Einstellungen", component: "GlobalSettings" }
    ]
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    subcategories: [
      { id: "builder", title: "Dashboard Builder", component: "DashboardBuilder" },
      { id: "widgets", title: "Widget-Verwaltung", component: "WidgetManagement" },
      { id: "templates", title: "Dashboard-Vorlagen", component: "DashboardTemplates" }
    ]
  },
  {
    id: "system",
    title: "System",
    icon: Settings,
    subcategories: [
      { id: "general", title: "Allgemeine Einstellungen", component: "GeneralSettings" },
      { id: "system-config", title: "Systemkonfiguration", component: "SystemSettings" }
    ]
  },
  {
    id: "company", 
    title: "Unternehmen",
    icon: Building2,
    subcategories: [
      { id: "master-data", title: "Stammdaten", component: "CompanyMasterData" },
      { id: "organization", title: "Organisation", component: "CompanyOrganization" },
      { id: "legal", title: "Rechtliches", component: "CompanyLegal" },
      { id: "locations", title: "Standorte", component: "CompanyLocations" },
      { id: "communication", title: "Kommunikation", component: "CompanyCommunication" },
      { id: "reports", title: "Berichte", component: "CompanyReports" }
    ]
  },
  {
    id: "security",
    title: "Sicherheit",
    icon: Shield,
    subcategories: [
      { id: "security-settings", title: "Sicherheitseinstellungen", component: "SecuritySettings" }
    ]
  },
  {
    id: "calendar",
    title: "Kalender",
    icon: Calendar,
    subcategories: [
      { id: "sync", title: "Synchronisation", component: "CalendarSyncSettings" },
      { id: "holidays", title: "Feiertage", component: "CalendarHolidaySettings" },
      { id: "event-types", title: "Terminarten", component: "CalendarEventTypes" },
      { id: "booking-rules", title: "Buchungsregeln", component: "CalendarBookingRules" },
      { id: "reminders", title: "Erinnerungen", component: "CalendarReminderSettings" },
      { id: "approvals", title: "Genehmigungen", component: "CalendarApprovalSettings" },
      { id: "scheduling", title: "Zeitplanung", component: "CalendarSchedulingSettings" },
      { id: "privacy", title: "Datenschutz", component: "CalendarPrivacySettings" },
      { id: "views", title: "Ansichten", component: "CalendarViewSettings" }
    ]
  },
  {
    id: "time",
    title: "Zeiterfassung",
    icon: Clock,
    subcategories: [
      { id: "rounding", title: "Rundungsregeln", component: "TimeRoundingSettings" },
      { id: "reminders", title: "Erinnerungen", component: "TimeReminderSettings" },
      { id: "payroll-sync", title: "Lohnabrechnung-Sync", component: "TimePayrollSyncSettings" },
      { id: "tracking", title: "Tracking-Einstellungen", component: "TimeTrackingSettings" }
    ]
  },
  {
    id: "absence",
    title: "Abwesenheit",
    icon: UserX,
    subcategories: [
      { id: "general", title: "Allgemein", component: "AbsenceGeneralSettings" },
      { id: "types", title: "Abwesenheitsarten", component: "AbsenceTypesSettings" },
      { id: "approvals", title: "Genehmigungen", component: "AbsenceApprovalsSettings" },
      { id: "notifications", title: "Benachrichtigungen", component: "AbsenceNotificationsSettings" },
      { id: "integrations", title: "Integrationen", component: "AbsenceIntegrationsSettings" },
      { id: "visibility", title: "Sichtbarkeit & Rollen", component: "AbsenceVisibilitySettings" }
    ]
  },
  {
    id: "worktime-absence",
    title: "Arbeitszeit & Abwesenheiten",
    icon: Timer,
    subcategories: [
      { id: "overview", title: "Übersicht", component: "WorktimeAbsenceOverview" },
      { id: "working-models", title: "Arbeitszeitmodelle", component: "WorkingTimeModels" },
      { id: "absence-types", title: "Abwesenheitsarten", component: "AbsenceTypes" },
      { id: "approval-workflows", title: "Genehmigungsprozesse", component: "ApprovalWorkflows" },
      { id: "drag-drop", title: "Drag & Drop Konfiguration", component: "DragDropConfig" }
    ]
  },
  {
    id: "budget",
    title: "Budget",
    icon: DollarSign,
    subcategories: [
      { id: "intervals", title: "Intervalle", component: "BudgetIntervalSettings" },
      { id: "export", title: "Export", component: "BudgetExportSettings" }
    ]
  },
  {
    id: "payroll",
    title: "Lohnabrechnung",
    icon: Receipt,
    subcategories: [
      { id: "benefits", title: "Zusatzleistungen", component: "PayrollBenefitSettings" },
      { id: "gdpr", title: "DSGVO", component: "PayrollGdprSettings" }
    ]
  },
  {
    id: "timetracking-settings",
    title: "Zeiterfassung",
    icon: Clock,
    subcategories: [
      { id: "timetracking-config", title: "Zeiterfassung Konfiguration", component: "TimeTrackingSettings" }
    ]
  },
  {
    id: "recruiting",
    title: "Recruiting",
    icon: UserPlus,
    subcategories: [
      { id: "recruiting-settings", title: "Recruiting & Bewerbermanagement", component: "RecruitingSettings" }
    ]
  },
  // NEU: Aufgaben-Einstellungen
  {
    id: "tasks",
    title: "Aufgaben",
    icon: CheckSquare,
    subcategories: [
      { id: "task-config", title: "Aufgaben-Konfiguration", component: "TaskSettings" },
      { id: "task-priorities", title: "Prioritäten & Labels", component: "TaskPrioritySettings" },
      { id: "task-workflows", title: "Aufgaben-Workflows", component: "TaskWorkflowSettings" },
      { id: "task-templates", title: "Aufgabenvorlagen", component: "TaskTemplateSettings" }
    ]
  },
  // NEU: Projekte & Roadmaps erweitert
  {
    id: "projects",
    title: "Projekte & Roadmaps",
    icon: FolderKanban,
    subcategories: [
      { id: "project-config", title: "Projekt-Konfiguration", component: "ProjectConfigSettings" },
      { id: "project-templates", title: "Projektvorlagen", component: "ProjectTemplateSettings" },
      { id: "roadmap-config", title: "Roadmap-Einstellungen", component: "RoadmapSettings" },
      { id: "project-statuses", title: "Status & Phasen", component: "ProjectStatusSettings" },
      { id: "portfolio", title: "Portfolio-Dashboard", component: "ProjectPortfolioSettings" }
    ]
  },
  // NEU: Helpdesk-Einstellungen
  {
    id: "helpdesk",
    title: "Helpdesk",
    icon: Headphones,
    subcategories: [
      { id: "helpdesk-config", title: "Helpdesk-Konfiguration", component: "HelpdeskSettings" },
      { id: "ticket-categories", title: "Ticket-Kategorien", component: "TicketCategorySettings" },
      { id: "sla-config", title: "SLA-Konfiguration", component: "SLASettings" },
      { id: "escalation-rules", title: "Eskalationsregeln", component: "EscalationRulesSettings" },
      { id: "auto-assignment", title: "Auto-Zuweisung", component: "AutoAssignmentSettings" }
    ]
  },
  // NEU: Schichtplanung-Einstellungen
  {
    id: "shift-planning",
    title: "Schichtplanung",
    icon: CalendarDays,
    subcategories: [
      { id: "shift-models", title: "Schichtmodelle", component: "ShiftModelSettings" },
      { id: "shift-rules", title: "Schichtregeln", component: "ShiftRulesSettings" },
      { id: "shift-templates", title: "Schichtvorlagen", component: "ShiftTemplateSettings" },
      { id: "rotation-patterns", title: "Rotationsmuster", component: "RotationPatternSettings" }
    ]
  },
  // NEU: Spesenabrechnung-Einstellungen
  {
    id: "expenses",
    title: "Spesenabrechnung",
    icon: Wallet,
    subcategories: [
      { id: "expense-categories", title: "Spesenkategorien", component: "ExpenseCategorySettings" },
      { id: "expense-limits", title: "Limits & Budgets", component: "ExpenseLimitSettings" },
      { id: "expense-workflows", title: "Genehmigungsworkflows", component: "ExpenseWorkflowSettings" },
      { id: "receipt-rules", title: "Belegpflichten", component: "ReceiptRulesSettings" },
      { id: "mileage-rates", title: "Kilometersätze", component: "MileageRateSettings" }
    ]
  },
  // NEU: Rewards-Einstellungen
  {
    id: "rewards",
    title: "Rewards & Anerkennung",
    icon: Gift,
    subcategories: [
      { id: "reward-types", title: "Reward-Typen", component: "RewardTypeSettings" },
      { id: "point-system", title: "Punktesystem", component: "PointSystemSettings" },
      { id: "reward-catalog", title: "Prämien-Katalog", component: "RewardCatalogSettings" },
      { id: "recognition-rules", title: "Anerkennungsregeln", component: "RecognitionRulesSettings" }
    ]
  },
  // NEU: Onboarding-Einstellungen
  {
    id: "onboarding",
    title: "Onboarding",
    icon: UserCheck,
    subcategories: [
      { id: "onboarding-templates", title: "Onboarding-Vorlagen", component: "OnboardingTemplateSettings" },
      { id: "onboarding-checklists", title: "Checklisten", component: "OnboardingChecklistSettings" },
      { id: "onboarding-workflows", title: "Onboarding-Workflows", component: "OnboardingWorkflowSettings" },
      { id: "buddy-system", title: "Buddy-System", component: "BuddySystemSettings" }
    ]
  },
  // NEU: Offboarding-Einstellungen
  {
    id: "offboarding",
    title: "Offboarding",
    icon: UserX,
    subcategories: [
      { id: "offboarding-templates", title: "Offboarding-Vorlagen", component: "OffboardingTemplateSettings" },
      { id: "exit-interviews", title: "Exit-Interviews", component: "ExitInterviewSettings" },
      { id: "asset-return", title: "Rückgabe-Prozess", component: "AssetReturnSettings" },
      { id: "knowledge-transfer", title: "Wissenstransfer", component: "KnowledgeTransferSettings" }
    ]
  },
  // NEU: Workflow-Einstellungen
  {
    id: "workflow",
    title: "Workflow-Management",
    icon: GitBranch,
    subcategories: [
      { id: "workflow-designer", title: "Workflow-Designer", component: "WorkflowDesignerSettings" },
      { id: "approval-chains", title: "Genehmigungsketten", component: "ApprovalChainSettings" },
      { id: "automation-rules", title: "Automatisierungsregeln", component: "AutomationRulesSettings" },
      { id: "triggers", title: "Trigger & Aktionen", component: "TriggerActionSettings" }
    ]
  },
  // NEU: Innovation-Einstellungen
  {
    id: "innovation",
    title: "Innovation & Ideen",
    icon: Lightbulb,
    subcategories: [
      { id: "idea-management", title: "Ideenmanagement", component: "IdeaManagementSettings" },
      { id: "voting-rules", title: "Abstimmungsregeln", component: "VotingRulesSettings" },
      { id: "innovation-challenges", title: "Innovation Challenges", component: "InnovationChallengeSettings" },
      { id: "reward-innovation", title: "Innovations-Prämien", component: "InnovationRewardSettings" }
    ]
  },
  // NEU: Knowledge Hub-Einstellungen
  {
    id: "knowledge",
    title: "Knowledge Hub",
    icon: BookOpen,
    subcategories: [
      { id: "knowledge-categories", title: "Wissenskategorien", component: "KnowledgeCategorySettings" },
      { id: "article-templates", title: "Artikelvorlagen", component: "ArticleTemplateSettings" },
      { id: "review-process", title: "Review-Prozess", component: "ReviewProcessSettings" },
      { id: "access-rights", title: "Zugriffsrechte", component: "KnowledgeAccessSettings" }
    ]
  },
  // NEU: Global Mobility-Einstellungen
  {
    id: "global-mobility",
    title: "Global Mobility",
    icon: Map,
    subcategories: [
      { id: "relocation-policies", title: "Umzugsrichtlinien", component: "RelocationPolicySettings" },
      { id: "assignment-types", title: "Einsatzarten", component: "AssignmentTypeSettings" },
      { id: "visa-management", title: "Visa-Management", component: "VisaManagementSettings" },
      { id: "tax-compliance", title: "Steuer-Compliance", component: "TaxComplianceSettings" }
    ]
  },
  // NEU: Workforce Planning-Einstellungen
  {
    id: "workforce-planning",
    title: "Workforce Planning",
    icon: UsersRound,
    subcategories: [
      { id: "capacity-planning", title: "Kapazitätsplanung", component: "CapacityPlanningSettings" },
      { id: "skill-matrix", title: "Skill-Matrix", component: "SkillMatrixSettings" },
      { id: "succession-planning", title: "Nachfolgeplanung", component: "SuccessionPlanningSettings" },
      { id: "headcount-planning", title: "Headcount-Planung", component: "HeadcountPlanningSettings" }
    ]
  },
  // NEU: Geschäftsreisen-Einstellungen
  {
    id: "business-travel",
    title: "Geschäftsreisen",
    icon: Plane,
    subcategories: [
      { id: "travel-policies", title: "Reiserichtlinien", component: "TravelPolicySettings" },
      { id: "booking-rules", title: "Buchungsregeln", component: "BookingRulesSettings" },
      { id: "travel-budgets", title: "Reisebudgets", component: "TravelBudgetSettings" },
      { id: "duty-of-care", title: "Duty of Care", component: "DutyOfCareSettings" },
      { id: "co2-tracking", title: "CO₂-Tracking", component: "CO2TrackingSettings" }
    ]
  },
  // NEU: Organigramm-Einstellungen
  {
    id: "orgchart",
    title: "Organigramm",
    icon: Network,
    subcategories: [
      { id: "org-structure", title: "Organisationsstruktur", component: "OrgStructureSettings" },
      { id: "reporting-lines", title: "Berichtslinien", component: "ReportingLineSettings" },
      { id: "org-display", title: "Anzeigeoptionen", component: "OrgDisplaySettings" }
    ]
  },
  // NEU: Assets & Equipment-Einstellungen
  {
    id: "assets",
    title: "Assets & Equipment",
    icon: Briefcase,
    subcategories: [
      { id: "asset-categories", title: "Asset-Kategorien", component: "AssetCategorySettings" },
      { id: "inventory-rules", title: "Inventar-Regeln", component: "InventoryRulesSettings" },
      { id: "assignment-rules", title: "Zuweisungsregeln", component: "AssetAssignmentSettings" },
      { id: "depreciation", title: "Abschreibungen", component: "DepreciationSettings" }
    ]
  },
  {
    id: "users",
    title: "Benutzerverwaltung",
    icon: Users,
    subcategories: [
      { id: "user-management", title: "Benutzerverwaltung", component: "UserManagement" }
    ]
  },
  {
    id: "permissions",
    title: "Rechtematrix",
    icon: ShieldCheck,
    subcategories: [
      { id: "enterprise-matrix", title: "Enterprise Rechtematrix", component: "EnterprisePermissionMatrix" },
      { id: "role-management", title: "Rollenverwaltung", component: "RoleManagement" },
      { id: "permission-audit", title: "Berechtigungs-Audit", component: "PermissionAudit" }
    ]
  },
  {
    id: "communication",
    title: "Kommunikation & Benachrichtigungen",
    icon: Bell,
    subcategories: [
      { id: "communication-settings", title: "Kommunikationseinstellungen", component: "CommunicationSettings" }
    ]
  },
  {
    id: "documents",
    title: "Dokumente",
    icon: FileCheck,
    subcategories: [
      { id: "document-settings", title: "Dokumenteneinstellungen", component: "DocumentSettings" }
    ]
  },
  {
    id: "integrations",
    title: "Integrationen",
    icon: Plug,
    subcategories: [
      { id: "integration-settings", title: "Integrationseinstellungen", component: "IntegrationSettings" }
    ]
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: FileCheck,
    subcategories: [
      { id: "compliance-settings", title: "Compliance-Einstellungen", component: "ComplianceSettings" }
    ]
  }
];
