/**
 * ZERO-DATA-START: Module-Gates Konfiguration
 * 
 * Definiert die Voraussetzungen für jedes Modul.
 * Wenn diese nicht erfüllt sind, wird das Modul gesperrt
 * und ein Hinweis auf die erforderlichen Einstellungen angezeigt.
 */

export interface ModuleRequirement {
  name: string;
  description: string;
  requires: RequirementKey[];
  settingsPath: string;
}

export type RequirementKey = 
  | 'locations'
  | 'departments'
  | 'teams'
  | 'employees'
  | 'shift_models'
  | 'work_time_models'
  | 'absence_types'
  | 'cost_centers'
  | 'project_categories'
  | 'roles'
  | 'workflows'
  | 'compliance_rules'
  | 'skill_categories';

export const REQUIREMENT_LABELS: Record<RequirementKey, string> = {
  locations: 'Standorte',
  departments: 'Abteilungen',
  teams: 'Teams',
  employees: 'Mitarbeiter',
  shift_models: 'Schichtmodelle',
  work_time_models: 'Arbeitszeitmodelle',
  absence_types: 'Abwesenheitstypen',
  cost_centers: 'Kostenstellen',
  project_categories: 'Projektkategorien',
  roles: 'Rollen & Rechte',
  workflows: 'Workflows',
  compliance_rules: 'Compliance-Regeln',
  skill_categories: 'Skill-Kategorien'
};

export const REQUIREMENT_SETTINGS_PATHS: Record<RequirementKey, string> = {
  locations: '/settings/locations',
  departments: '/settings/organization',
  teams: '/settings/organization',
  employees: '/settings/employees',
  shift_models: '/settings/shift-planning',
  work_time_models: '/settings/time-tracking',
  absence_types: '/settings/absence',
  cost_centers: '/settings/cost-centers',
  project_categories: '/settings/projects',
  roles: '/settings/roles',
  workflows: '/settings/workflows',
  compliance_rules: '/settings/compliance',
  skill_categories: '/settings/skills'
};

export const MODULE_REQUIREMENTS: Record<string, ModuleRequirement> = {
  // Schichtplanung
  'shift-planning': {
    name: 'Schichtplanung',
    description: 'Erstellen und verwalten Sie Schichtpläne für Ihre Mitarbeiter.',
    requires: ['locations', 'teams', 'shift_models'],
    settingsPath: '/settings/shift-planning'
  },

  // Zeiterfassung
  'time-tracking': {
    name: 'Zeiterfassung',
    description: 'Erfassen und verwalten Sie Arbeitszeiten.',
    requires: ['work_time_models'],
    settingsPath: '/settings/time-tracking'
  },

  // Abwesenheitsverwaltung
  'absence': {
    name: 'Abwesenheitsverwaltung',
    description: 'Verwalten Sie Urlaub, Krankheit und andere Abwesenheiten.',
    requires: ['absence_types'],
    settingsPath: '/settings/absence'
  },

  // Projekte
  'projects': {
    name: 'Projektverwaltung',
    description: 'Verwalten Sie Projekte und deren Ressourcen.',
    requires: ['project_categories'],
    settingsPath: '/settings/projects'
  },

  // Aufgaben
  'tasks': {
    name: 'Aufgabenverwaltung',
    description: 'Erstellen und verwalten Sie Aufgaben.',
    requires: [], // Keine harten Anforderungen - kann ohne Voraussetzungen genutzt werden
    settingsPath: '/settings/tasks'
  },

  // Performance
  'performance': {
    name: 'Performance Management',
    description: 'Bewerten und entwickeln Sie Mitarbeiter-Performance.',
    requires: ['employees', 'departments'],
    settingsPath: '/settings/performance'
  },

  // Recruiting
  'recruiting': {
    name: 'Recruiting',
    description: 'Verwalten Sie Stellenausschreibungen und Bewerbungen.',
    requires: ['departments'],
    settingsPath: '/settings/recruiting'
  },

  // Onboarding
  'onboarding': {
    name: 'Onboarding',
    description: 'Führen Sie neue Mitarbeiter strukturiert ein.',
    requires: ['departments'],
    settingsPath: '/settings/onboarding'
  },

  // Berichte
  'reports': {
    name: 'Berichte & Analytics',
    description: 'Analysieren Sie HR-Daten und erstellen Sie Berichte.',
    requires: ['employees'],
    settingsPath: '/settings/reports'
  },

  // Compliance
  'compliance': {
    name: 'Compliance',
    description: 'Überwachen Sie die Einhaltung von Vorschriften.',
    requires: ['compliance_rules'],
    settingsPath: '/settings/compliance'
  },

  // Geschäftsreisen
  'travel': {
    name: 'Geschäftsreisen',
    description: 'Verwalten Sie Dienstreisen und Reisekosten.',
    requires: ['cost_centers'],
    settingsPath: '/settings/travel'
  },

  // Budget
  'budget': {
    name: 'Budget & Forecast',
    description: 'Planen und überwachen Sie Budgets.',
    requires: ['cost_centers', 'departments'],
    settingsPath: '/settings/budget'
  },

  // Roadmap
  'roadmap': {
    name: 'Roadmap',
    description: 'Planen Sie strategische Initiativen und Meilensteine.',
    requires: [],
    settingsPath: '/settings/roadmap'
  },

  // Innovation Hub
  'innovation': {
    name: 'Innovation Hub',
    description: 'Sammeln und entwickeln Sie innovative Ideen.',
    requires: [],
    settingsPath: '/settings/innovation'
  },

  // Benefits
  'benefits': {
    name: 'Benefits',
    description: 'Verwalten Sie Mitarbeiter-Benefits und Vergünstigungen.',
    requires: ['employees'],
    settingsPath: '/settings/benefits'
  }
};

/**
 * Hilfsfunktion: Gibt die lesbaren Labels für fehlende Requirements zurück
 */
export function getRequirementLabels(requirements: RequirementKey[]): string[] {
  return requirements.map(req => REQUIREMENT_LABELS[req]);
}

/**
 * Hilfsfunktion: Gibt den ersten relevanten Settings-Pfad zurück
 */
export function getFirstSettingsPath(requirements: RequirementKey[]): string {
  if (requirements.length === 0) return '/settings';
  return REQUIREMENT_SETTINGS_PATHS[requirements[0]];
}
