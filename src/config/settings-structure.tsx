import { 
  Users, Shield, Building2, Clock, Calculator, UserPlus, 
  Target, GraduationCap, FileText, Bell, Plug, Settings2,
  Lock, UserCircle, Workflow, FileBox, Building, Calendar,
  PieChart, Database, ListChecks, Upload, Mail, Headphones,
  CreditCard, Contact, BarChart2, BadgePercent, Notebook,
  Key, Bot, Layers, HardDrive, User, LayoutGrid, Briefcase,
  Download, X, Share2, Network, LucideIcon, Brain
} from "lucide-react";

// Typen für die Settings-Struktur
export interface SettingsSubSubcategory {
  id: string;
  title: string;
  description?: string;
  component: string;
}

export interface SettingsSubcategory {
  id: string;
  title: string;
  description?: string;
  component?: string;
  subSubcategories?: SettingsSubSubcategory[];
}

export interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  component?: string;
  subcategories?: SettingsSubcategory[];
}

export const settingsStructure: SettingsCategory[] = [
  {
    id: "user-roles",
    title: "Benutzer & Rollen",
    description: "Verwaltung von Mitarbeitern, Rollen und Zugriffen",
    path: "/settings/users",
    icon: Users,
    subcategories: [
      {
        id: "user-management",
        title: "Benutzerverwaltung",
        component: "UserManagement",
        subSubcategories: [
          {
            id: "user-edit",
            title: "Benutzer anlegen / bearbeiten / deaktivieren",
            component: "UserEdit"
          },
          {
            id: "user-import",
            title: "Benutzer-Import (Excel, CSV, API)",
            component: "UserImport"
          },
          {
            id: "user-history",
            title: "Benutzer-Historie & Änderungsprotokoll",
            component: "UserHistory"
          },
          {
            id: "user-profile",
            title: "Benutzerbild & Sprachprofil",
            component: "UserProfile"
          }
        ]
      },
      {
        id: "roles-permissions",
        title: "Rollen & Berechtigungen",
        component: "RolesPermissions",
        subSubcategories: [
          {
            id: "role-edit",
            title: "Rollen erstellen / bearbeiten / klonen",
            component: "RoleEdit"
          },
          {
            id: "module-access",
            title: "Modulzugriff per Rolle verwalten",
            component: "ModuleAccess"
          },
          {
            id: "visibility-rules",
            title: "Sichtbarkeitsregeln pro Feld/Modul",
            component: "VisibilityRules"
          }
        ]
      },
      {
        id: "teams-structures",
        title: "Teams & Strukturen",
        component: "TeamsStructures",
        subSubcategories: [
          {
            id: "departments",
            title: "Abteilungen & Gruppen verwalten",
            component: "Departments"
          },
          {
            id: "team-lead",
            title: "Teamleiter-Zuweisung",
            component: "TeamLead"
          },
          {
            id: "substitutes",
            title: "Vertretungsregelung",
            component: "Substitutes"
          }
        ]
      },
      {
        id: "temp-rights",
        title: "Temporäre Rechte & Delegation",
        component: "TempRights",
        subSubcategories: [
          {
            id: "time-limited",
            title: "Zeitlich begrenzte Rollen",
            component: "TimeLimited"
          },
          {
            id: "auto-rights",
            title: "Automatisierte Rechtematrix",
            component: "AutoRights"
          }
        ]
      }
    ]
  },
  {
    id: "company-info",
    title: "Unternehmensinformationen",
    description: "Wichtige Daten & Identität des Unternehmens",
    path: "/settings/company",
    icon: Building2,
    subcategories: [
      {
        id: "core-data",
        title: "Stammdaten & Identität",
        component: "CoreData",
        subSubcategories: [
          {
            id: "company-basics",
            title: "Firmennamen, Sitz, Branche",
            component: "CompanyBasics"
          },
          {
            id: "legal-info",
            title: "Steuernummer, Handelsregister, IBAN",
            component: "LegalInfo"
          },
          {
            id: "branding",
            title: "Branding (Logo, Farben, Schriftarten)",
            component: "Branding"
          }
        ]
      },
      {
        id: "locations",
        title: "Standorte & Einheiten",
        component: "Locations",
        subSubcategories: [
          {
            id: "manage-locations",
            title: "Standorte verwalten",
            component: "ManageLocations"
          },
          {
            id: "location-lead",
            title: "Standortleiter / HR-Kontakt",
            component: "LocationLead"
          },
          {
            id: "regional-holidays",
            title: "Regionale Feiertage & Kalender",
            component: "RegionalHolidays"
          }
        ]
      }
    ]
  },
  {
    id: "work-time",
    title: "Arbeitszeit & Abwesenheiten",
    description: "Steuerung von Arbeitsmodellen & Abwesenheitsregeln",
    path: "/settings/time",
    icon: Clock,
    subcategories: [
      {
        id: "work-models",
        title: "Arbeitszeitmodelle",
        component: "WorkModels",
        subSubcategories: [
          {
            id: "time-models",
            title: "Festzeit, Gleitzeit, Teilzeit, Schicht, etc.",
            component: "TimeModels"
          },
          {
            id: "weekly-hours",
            title: "Wochenstunden / Tageszeitprofile",
            component: "WeeklyHours"
          },
          {
            id: "break-rules",
            title: "Automatische Pausenregeln",
            component: "BreakRules"
          }
        ]
      },
      {
        id: "absence-types",
        title: "Abwesenheitsarten",
        component: "AbsenceTypes",
        subSubcategories: [
          {
            id: "absence-categories",
            title: "Urlaub, Krankheit, Pflege, Sonderurlaub",
            component: "AbsenceCategories"
          },
          {
            id: "absence-policies",
            title: "Abwesenheitsrichtlinien je Rolle",
            component: "AbsencePolicies"
          },
          {
            id: "vacation-logic",
            title: "Resturlaubs-Logik & Verfall",
            component: "VacationLogic"
          }
        ]
      },
      {
        id: "overtime",
        title: "Überstunden & Gleitzeitkonten",
        component: "Overtime",
        subSubcategories: [
          {
            id: "calculation-rules",
            title: "Regelwerk zur Berechnung",
            component: "CalculationRules"
          },
          {
            id: "approval-process",
            title: "Genehmigungsprozesse",
            component: "ApprovalProcess"
          },
          {
            id: "compensation",
            title: "Auszahlung oder Zeitausgleich",
            component: "Compensation"
          }
        ]
      },
      {
        id: "shift-planning",
        title: "Schichtplanung",
        component: "TimeTrackingSettings",
        subSubcategories: [
          {
            id: "shift-types",
            title: "Schichtarten & Zeiten",
            component: "ShiftTypes"
          },
          {
            id: "shift-rules",
            title: "Planungsregeln & Besetzung",
            component: "ShiftRules"
          },
          {
            id: "shift-rotation",
            title: "Schichtrotation & Zyklen",
            component: "ShiftRotation"
          }
        ]
      }
    ]
  },
  {
    id: "payroll",
    title: "Gehalts- & Lohnabrechnung",
    description: "Verwaltung von Vergütungsrichtlinien & Abrechnungen",
    path: "/settings/payroll",
    icon: Calculator,
    subcategories: [
      {
        id: "wage-types",
        title: "Lohnarten & Zuschläge",
        component: "WageTypes",
        subSubcategories: [
          {
            id: "basic-wages",
            title: "Grundgehalt, Bonus, Nachtschicht, Feiertagszuschlag",
            component: "BasicWages"
          },
          {
            id: "benefits",
            title: "Sachbezüge & geldwerte Vorteile",
            component: "Benefits"
          }
        ]
      },
      {
        id: "payroll-runs",
        title: "Abrechnungsläufe",
        component: "PayrollRuns",
        subSubcategories: [
          {
            id: "intervals",
            title: "Intervall (Monatlich, Quartal etc.)",
            component: "Intervals"
          },
          {
            id: "preview",
            title: "Vorschau & Vorbereitungsphase",
            component: "Preview"
          },
          {
            id: "correction",
            title: "Korrekturläufe & Nachberechnung",
            component: "Correction"
          }
        ]
      },
      {
        id: "payroll-interfaces",
        title: "Schnittstellen zu Lohnsystemen",
        component: "PayrollInterfaces",
        subSubcategories: [
          {
            id: "systems",
            title: "DATEV, SAP, Personio etc.",
            component: "Systems"
          },
          {
            id: "sync",
            title: "Live-Synchronisation",
            component: "Sync"
          },
          {
            id: "mapping",
            title: "Formatdefinition & Mapping",
            component: "Mapping"
          }
        ]
      }
    ]
  },
  {
    id: "recruiting",
    title: "Recruiting & Bewerbermanagement",
    description: "Einstellungen zur Personalgewinnung",
    path: "/settings/recruiting",
    icon: UserPlus,
    subcategories: [
      {
        id: "application-process",
        title: "Bewerbungsprozesse",
        component: "ApplicationProcess",
        subSubcategories: [
          {
            id: "process-steps",
            title: "Schritte (Screening → Interview → Entscheidung)",
            component: "ProcessSteps"
          },
          {
            id: "evaluation",
            title: "Bewertungsschema (Skalen, Notizen, Entscheidungshilfe)",
            component: "Evaluation"
          }
        ]
      },
      {
        id: "job-portals",
        title: "Jobportale & Ausschreibungen",
        component: "JobPortals",
        subSubcategories: [
          {
            id: "interfaces",
            title: "Schnittstellen zu StepStone, LinkedIn, Indeed",
            component: "Interfaces"
          },
          {
            id: "campaign",
            title: "Kampagnenanalyse",
            component: "Campaign"
          }
        ]
      },
      {
        id: "applicant-communication",
        title: "Bewerberkommunikation",
        component: "ApplicantCommunication",
        subSubcategories: [
          {
            id: "email-templates",
            title: "E-Mail-Vorlagen",
            component: "EmailTemplates"
          },
          {
            id: "privacy",
            title: "Datenschutz & Einwilligung",
            component: "Privacy"
          }
        ]
      }
    ]
  },
  {
    id: "performance",
    title: "Ziel- & Performance-Management",
    description: "Regeln & Methoden zur Zielverfolgung",
    path: "/settings/performance",
    icon: Target,
    subcategories: [
      {
        id: "goal-types",
        title: "Zielarten & Templates",
        component: "GoalTypes",
        subSubcategories: [
          {
            id: "goal-levels",
            title: "Individuelle, Team-, Unternehmensziele",
            component: "GoalLevels"
          },
          {
            id: "smart-templates",
            title: "SMART-Vorlagen",
            component: "SmartTemplates"
          }
        ]
      },
      {
        id: "review-processes",
        title: "Bewertung & Review-Prozesse",
        component: "ReviewProcesses",
        subSubcategories: [
          {
            id: "feedback-360",
            title: "360° Feedback",
            component: "Feedback360"
          },
          {
            id: "review-phases",
            title: "Bewertungsphasen & Deadlines",
            component: "ReviewPhases"
          }
        ]
      }
    ]
  },
  {
    id: "training",
    title: "Weiterbildung & Schulungen",
    description: "Einstellungen für Mitarbeiterentwicklung",
    path: "/settings/training",
    icon: GraduationCap,
    subcategories: [
      {
        id: "training-catalog",
        title: "Schulungskatalog",
        component: "TrainingCatalog",
        subSubcategories: [
          {
            id: "providers",
            title: "Interne & externe Anbieter",
            component: "Providers"
          },
          {
            id: "training-types",
            title: "Schulungsarten (Online, Präsenz, Hybrid)",
            component: "TrainingTypes"
          }
        ]
      },
      {
        id: "participation",
        title: "Teilnahme & Zertifikate",
        component: "Participation",
        subSubcategories: [
          {
            id: "history",
            title: "Historie & Status",
            component: "History"
          },
          {
            id: "mandatory",
            title: "Pflichtschulungen mit Erinnerungen",
            component: "Mandatory"
          }
        ]
      }
    ]
  },
  {
    id: "documents",
    title: "Dokumentenmanagement & DSGVO",
    description: "Verwaltung von Dokumenten & Datenschutz",
    path: "/settings/documents",
    icon: FileText,
    subcategories: [
      {
        id: "documents-templates",
        title: "Dokumente & Vorlagen",
        component: "DocumentsTemplates",
        subSubcategories: [
          {
            id: "contract-documents",
            title: "Verträge, AGBs, HR-Dokumente",
            component: "ContractDocuments"
          },
          {
            id: "tagging",
            title: "Tagging & Filterung",
            component: "Tagging"
          }
        ]
      },
      {
        id: "gdpr",
        title: "DSGVO-Verwaltung",
        component: "GDPR",
        subSubcategories: [
          {
            id: "consents",
            title: "Einwilligungen, Widerruf, Einsicht",
            component: "Consents"
          },
          {
            id: "deletion",
            title: "Löschfristen & Automatisierung",
            component: "Deletion"
          }
        ]
      }
    ]
  },
  {
    id: "notifications",
    title: "Kommunikation & Benachrichtigungen",
    description: "Steuerung der internen Kommunikation",
    path: "/settings/notifications",
    icon: Bell,
    subcategories: [
      {
        id: "notifications-reminders",
        title: "Benachrichtigungen & Erinnerungen",
        component: "NotificationsReminders",
        subSubcategories: [
          {
            id: "recipients",
            title: "Wann & wer bekommt was?",
            component: "Recipients"
          },
          {
            id: "channels",
            title: "Frequenz, Kanal (App, E-Mail, SMS)",
            component: "Channels"
          }
        ]
      },
      {
        id: "visibility-rules",
        title: "Sichtbarkeit & Sichtbarkeitsregeln",
        component: "VisibilityRules",
        subSubcategories: [
          {
            id: "module-visibility",
            title: "Modulweise Steuerung",
            component: "ModuleVisibility"
          },
          {
            id: "field-visibility",
            title: "Sichtbarkeit auf Feldebene",
            component: "FieldVisibility"
          }
        ]
      }
    ]
  },
  {
    id: "integrations",
    title: "API & Integrationen",
    description: "Externe Tools & Schnittstellen verwalten",
    path: "/settings/integrations",
    icon: Plug,
    subcategories: [
      {
        id: "api-access",
        title: "API-Zugriffe & Tokens",
        component: "ApiAccess",
        subSubcategories: [
          {
            id: "oauth-tokens",
            title: "OAuth2, Token-Erstellung",
            component: "OAuthTokens"
          },
          {
            id: "access-restrictions",
            title: "Zugriffseinschränkungen",
            component: "AccessRestrictions"
          }
        ]
      },
      {
        id: "third-party",
        title: "Drittanbieter-Systeme",
        component: "ThirdParty",
        subSubcategories: [
          {
            id: "system-connections",
            title: "Buchhaltung, Projektmanagement, Bewerbertools",
            component: "SystemConnections"
          },
          {
            id: "interface-mapping",
            title: "Schnittstellen-Mapping",
            component: "InterfaceMapping"
          }
        ]
      }
    ]
  },
  {
    id: "system",
    title: "System & Sicherheit",
    description: "Systemeinstellungen & Sicherheitskonfiguration",
    path: "/settings/system",
    icon: Shield,
    subcategories: [
      {
        id: "password-security",
        title: "Passwort & Login-Sicherheit",
        component: "PasswordSecurity",
        subSubcategories: [
          {
            id: "password-policy",
            title: "Passwort-Policy",
            component: "PasswordPolicy"
          },
          {
            id: "two-factor",
            title: "Zwei-Faktor-Authentifizierung",
            component: "TwoFactor"
          }
        ]
      },
      {
        id: "audit-logs",
        title: "Audit Logs",
        component: "AuditLogs",
        subSubcategories: [
          {
            id: "login-activity",
            title: "Login- & Systemaktivitäten",
            component: "LoginActivity"
          },
          {
            id: "change-logs",
            title: "Änderungsprotokolle",
            component: "ChangeLogs"
          }
        ]
      }
    ]
  },
  {
    id: "ai",
    title: "KI & Automatisierung",
    description: "Einstellungen für KI-Funktionen und Automatisierungen",
    path: "/settings/ai",
    icon: Brain,
    subcategories: [
      {
        id: "ai-modules",
        title: "KI-Module aktivieren",
        component: "AiModules",
        subSubcategories: [
          {
            id: "module-activation",
            title: "Zeiterfassung, Recruiting, Performance",
            component: "ModuleActivation"
          }
        ]
      },
      {
        id: "automation-config",
        title: "Automatisierung konfigurieren",
        component: "AutomationConfig",
        subSubcategories: [
          {
            id: "trigger-actions",
            title: "Trigger-Aktionen",
            component: "TriggerActions"
          },
          {
            id: "suggestion-logic",
            title: "Vorschlagslogik bei Entscheidungen",
            component: "SuggestionLogic"
          }
        ]
      }
    ]
  }
];
