// Ultra-granulare Rechtematrix Typen
export interface PermissionAction {
  id: string;
  name: string;
  description?: string;
}

export interface TimeWindow {
  start: string; // "08:00"
  end: string;   // "18:00"
  days?: string[]; // ["monday", "tuesday", ...]
}

export interface RoleLimit {
  action: string;
  maxPerDay?: number;
  maxPerWeek?: number;
  maxPerMonth?: number;
  timeWindow?: TimeWindow;
}

export interface SubmodulePermissions {
  name: string;
  description?: string;
  permissions: {
    canView: string[];
    canCreate?: string[];
    canEdit?: string[];
    canDelete?: string[];
    canApprove?: string[];
    canExport?: string[];
    canAssign?: string[];
    canComment?: string[];
    canTrigger?: string[];
    canSubscribe?: string[];
    canAudit?: string[];
    canArchive?: string[];
  };
  visibleFields: Record<string, string[]>; // role -> field names
  editableFields: Record<string, string[]>;
  notifications: {
    push?: string[];
    email?: string[];
    slack?: string[];
    sms?: string[];
    teams?: string[];
  };
  maxLimits?: Record<string, RoleLimit>;
  timeWindows?: Record<string, TimeWindow>;
  workflowStages?: string[];
  fieldValidations?: Record<string, any>;
}

export interface ModulePermissions {
  module: string;
  description?: string;
  icon?: string;
  allowedRoles: string[];
  isActive: boolean;
  submodules: SubmodulePermissions[];
  globalMeta?: {
    notificationsAllowed: boolean;
    auditTrailEnabled: boolean;
    exportEnabled: boolean;
    dataRetentionDays?: number;
  };
}

export interface PermissionMatrix {
  version: string;
  lastUpdated: Date;
  modules: ModulePermissions[];
  availableRoles: string[];
  globalSettings: {
    maxSessionHours: number;
    forcePasswordChange: boolean;
    mfaRequired: string[]; // roles that require MFA
    ipWhitelist?: string[];
  };
}

// Vordefinierte Module-Struktur
export const DEFAULT_PERMISSION_MODULES: ModulePermissions[] = [
  {
    module: "Mitarbeiter",
    description: "Mitarbeiterverwaltung und Profile",
    icon: "Users",
    allowedRoles: ["superadmin", "admin", "hr", "manager", "employee"],
    isActive: true,
    submodules: [
      {
        name: "Profil",
        description: "Persönliche Daten und Profil",
        permissions: {
          canView: ["superadmin", "admin", "hr", "manager", "employee"],
          canEdit: ["superadmin", "admin", "hr", "employee"],
          canDelete: ["superadmin", "admin"],
          canExport: ["superadmin", "admin", "hr"]
        },
        visibleFields: {
          "superadmin": ["*"],
          "admin": ["name", "email", "position", "department", "salary", "documents"],
          "hr": ["name", "email", "position", "department", "salary", "documents", "emergency_contacts"],
          "manager": ["name", "email", "position", "department"],
          "employee": ["name", "email", "position", "department"]
        },
        editableFields: {
          "superadmin": ["*"],
          "admin": ["name", "email", "position", "department", "salary"],
          "hr": ["name", "email", "position", "department", "salary", "emergency_contacts"],
          "manager": [],
          "employee": ["emergency_contacts", "personal_notes"]
        },
        notifications: {
          push: ["employee"],
          email: ["hr", "admin", "superadmin"],
          slack: ["admin", "hr"]
        }
      },
      {
        name: "Dokumente",
        description: "Mitarbeiterdokumente und Zertifikate",
        permissions: {
          canView: ["superadmin", "admin", "hr", "employee"],
          canCreate: ["superadmin", "admin", "hr"],
          canEdit: ["superadmin", "admin", "hr"],
          canDelete: ["superadmin", "admin"],
          canExport: ["superadmin", "admin", "hr"]
        },
        visibleFields: {
          "superadmin": ["*"],
          "admin": ["*"],
          "hr": ["*"],
          "employee": ["certificates", "training_records"]
        },
        editableFields: {
          "superadmin": ["*"],
          "admin": ["*"],
          "hr": ["*"],
          "employee": []
        },
        notifications: {
          email: ["hr", "admin", "employee"],
          push: ["employee"]
        }
      }
    ]
  },
  {
    module: "Zeiterfassung",
    description: "Arbeitszeit und Tracking",
    icon: "Clock",
    allowedRoles: ["superadmin", "admin", "hr", "manager", "employee"],
    isActive: true,
    submodules: [
      {
        name: "Tagesansicht",
        description: "Tägliche Zeiterfassung",
        permissions: {
          canView: ["superadmin", "admin", "hr", "manager", "employee"],
          canCreate: ["employee"],
          canEdit: ["employee"],
          canApprove: ["manager", "admin", "hr"],
          canExport: ["admin", "hr", "manager"]
        },
        visibleFields: {
          "employee": ["start_time", "end_time", "breaks", "notes"],
          "manager": ["start_time", "end_time", "breaks", "notes", "total_hours", "overtime"],
          "hr": ["*"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "employee": ["start_time", "end_time", "breaks", "notes"],
          "manager": ["notes"],
          "hr": ["*"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        notifications: {
          push: ["employee"],
          email: ["manager", "hr"],
          slack: ["manager"]
        },
        maxLimits: {
          "employee": {
            action: "create",
            maxPerDay: 5
          }
        },
        timeWindows: {
          "canApprove": {
            start: "08:00",
            end: "18:00",
            days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
          }
        },
        workflowStages: ["submitted", "approved", "rejected", "completed"]
      },
      {
        name: "Gleitzeitkonto",
        description: "Flexible Arbeitszeiten verwalten",
        permissions: {
          canView: ["superadmin", "admin", "hr", "manager", "employee"],
          canEdit: ["admin", "hr"],
          canApprove: ["manager", "admin", "hr"]
        },
        visibleFields: {
          "employee": ["balance", "history"],
          "manager": ["balance", "history", "adjustments"],
          "hr": ["*"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "employee": [],
          "manager": ["adjustments"],
          "hr": ["*"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        notifications: {
          email: ["employee", "manager", "hr"],
          push: ["employee"]
        }
      }
    ]
  },
  {
    module: "Projekte",
    description: "Projektmanagement und Aufgaben",
    icon: "FolderOpen",
    allowedRoles: ["superadmin", "admin", "manager", "employee"],
    isActive: true,
    submodules: [
      {
        name: "Projektliste",
        description: "Übersicht aller Projekte",
        permissions: {
          canView: ["superadmin", "admin", "manager", "employee"],
          canCreate: ["superadmin", "admin", "manager"],
          canEdit: ["superadmin", "admin", "manager"],
          canDelete: ["superadmin", "admin"],
          canArchive: ["admin", "manager"]
        },
        visibleFields: {
          "employee": ["name", "description", "status", "deadlines"],
          "manager": ["name", "description", "status", "deadlines", "budget", "team_members"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "employee": [],
          "manager": ["name", "description", "status", "deadlines", "team_members"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        notifications: {
          push: ["employee", "manager"],
          email: ["admin", "manager"],
          slack: ["admin", "manager"]
        }
      },
      {
        name: "Budget",
        description: "Projektbudgets und Kosten",
        permissions: {
          canView: ["superadmin", "admin", "manager"],
          canEdit: ["superadmin", "admin"],
          canApprove: ["admin"]
        },
        visibleFields: {
          "manager": ["allocated_budget", "spent_budget"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "manager": [],
          "admin": ["allocated_budget", "budget_adjustments"],
          "superadmin": ["*"]
        },
        notifications: {
          email: ["admin", "manager"],
          slack: ["admin"]
        },
        maxLimits: {
          "manager": {
            action: "approve",
            maxPerWeek: 10
          }
        }
      }
    ]
  },
  {
    module: "Budget",
    description: "Finanzplanung und Budgets",
    icon: "DollarSign",
    allowedRoles: ["superadmin", "admin", "finance", "manager"],
    isActive: true,
    submodules: [
      {
        name: "Budgetplanung",
        description: "Jahres- und Quartalsplanung",
        permissions: {
          canView: ["superadmin", "admin", "finance", "manager"],
          canCreate: ["superadmin", "admin", "finance"],
          canEdit: ["superadmin", "admin", "finance"],
          canApprove: ["superadmin", "admin"]
        },
        visibleFields: {
          "manager": ["department_budget", "quarterly_forecast"],
          "finance": ["*"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "manager": [],
          "finance": ["budget_items", "forecasts", "adjustments"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        notifications: {
          email: ["finance", "admin", "manager"],
          slack: ["admin", "finance"]
        }
      }
    ]
  },
  {
    module: "KI",
    description: "Künstliche Intelligenz Features",
    icon: "Brain",
    allowedRoles: ["superadmin", "admin", "ai_team"],
    isActive: true,
    submodules: [
      {
        name: "Nutzungsanalyse",
        description: "KI-Nutzung und Kosten",
        permissions: {
          canView: ["superadmin", "admin", "ai_team"],
          canExport: ["superadmin", "admin"]
        },
        visibleFields: {
          "ai_team": ["usage_count", "cost", "saved_hours", "efficiency_score"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "ai_team": [],
          "admin": ["cost_limits", "usage_limits"],
          "superadmin": ["*"]
        },
        notifications: {
          push: ["ai_team"],
          email: ["admin", "ai_team"]
        }
      },
      {
        name: "Automatisierungen",
        description: "KI-gesteuerte Workflows",
        permissions: {
          canView: ["superadmin", "admin", "ai_team"],
          canTrigger: ["superadmin", "admin", "ai_team"],
          canApprove: ["superadmin", "admin"]
        },
        visibleFields: {
          "ai_team": ["automation_rules", "trigger_history", "performance_metrics"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        editableFields: {
          "ai_team": ["automation_rules"],
          "admin": ["*"],
          "superadmin": ["*"]
        },
        notifications: {
          email: ["admin", "ai_team"],
          slack: ["admin"]
        }
      }
    ]
  }
];