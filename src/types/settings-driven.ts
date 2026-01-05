// Settings-Driven Architecture (SDA) Types
// Oberste Priorität: Alle Funktionen werden ausschließlich durch Einstellungen gesteuert

/**
 * Gültigkeitsebenen für Einstellungen (Hierarchie von oben nach unten)
 */
export type SettingScopeLevel = 
  | 'global'      // Systemweit
  | 'company'     // Gesellschaft/Holding
  | 'location'    // Standort
  | 'department'  // Abteilung
  | 'team'        // Team
  | 'role'        // Rolle
  | 'user';       // Benutzer

/**
 * Vererbungsmodus für Einstellungen
 */
export type InheritanceMode = 
  | 'inherit'     // Erbt von übergeordneter Ebene
  | 'override'    // Überschreibt übergeordnete Ebene
  | 'locked';     // Gesperrt, kann nicht überschrieben werden

/**
 * Datentypen für Einstellungswerte
 */
export type SettingValueType = 
  | 'boolean'
  | 'number'
  | 'string'
  | 'json'
  | 'array'
  | 'enum';

/**
 * Scope einer Einstellung (auf welcher Ebene und für welche Entität)
 */
export interface SettingScope {
  level: SettingScopeLevel;
  entityId?: string;  // ID der Entität (Company ID, Location ID, etc.)
  entityName?: string; // Name für Anzeige
}

/**
 * 80/20 Sichtbarkeitsebene
 */
export type VisibilityLevel = 'standard' | 'advanced';

/**
 * 80/20 Risikostufe
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 80/20 Auswirkungsbereich
 */
export type ImpactScope = 'ui' | 'api' | 'legal' | 'finance' | 'security';

/**
 * 80/20 Durchsetzungskanal
 */
export type EnforcementChannel = 'ui' | 'api' | 'chatbot' | 'automation' | 'ai';

/**
 * Definition einer Einstellung (Metadaten) - 80/20 ENFORCEMENT
 * 
 * REGEL: Jede Einstellung MUSS diese Metadaten haben.
 * Fehlt ein Pflichtfeld → Einstellung wird nicht geladen.
 */
export interface SettingDefinition {
  id: string;
  module: string;           // z.B. 'timetracking', 'absence', 'tasks'
  submodule?: string;       // z.B. 'booking', 'approval', 'notifications'
  key: string;              // z.B. 'manual_booking_allowed'
  name: string;             // Anzeigename
  description: string;      // Beschreibung der Auswirkung
  valueType: SettingValueType;
  defaultValue: any;
  allowedValues?: any[];    // Bei enum: erlaubte Werte
  minValue?: number;        // Bei number: Minimalwert
  maxValue?: number;        // Bei number: Maximalwert
  isRequired: boolean;
  affectedFeatures: string[]; // Welche Features werden gesteuert?
  createdAt: string;
  updatedAt: string;
  
  // ========== 80/20 ENFORCEMENT METADATEN ==========
  
  /** Sichtbarkeitslevel: 'standard' (normal) oder 'advanced' (Experten) */
  visibilityLevel: VisibilityLevel;
  
  /** Empfohlener Wert (80/20 Standard) */
  recommendedValue: any;
  
  /** Risikostufe: 'low', 'medium', 'high' */
  riskLevel: RiskLevel;
  
  /** Auswirkungsbereich: ui, api, legal, finance, security */
  impactScope: ImpactScope[];
  
  /** Darf überschrieben werden? false = global gesperrt */
  overrideAllowed: boolean;
  
  /** Erlaubte Override-Ebenen */
  overrideScope: SettingScopeLevel[];
  
  /** Durchsetzungskanäle: ui, api, chatbot, automation, ai */
  enforcement: EnforcementChannel[];
  
  /** Audit-Pflicht: true = Änderungen werden geloggt */
  auditRequired: boolean;
  
  /** Rechtliche Referenz (z.B. DSGVO Artikel) */
  legalReference?: string;
  
  /** Kategorie für Gruppierung */
  category?: string;
}

/**
 * Konkreter Wert einer Einstellung
 */
export interface SettingValue {
  id: string;
  definitionId: string;
  module: string;
  key: string;
  value: any;
  scope: SettingScope;
  inheritanceMode: InheritanceMode;
  effectiveFrom?: string;   // Gültig ab (optional)
  effectiveTo?: string;     // Gültig bis (optional)
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

/**
 * Effektive Einstellung nach Auflösung der Vererbung
 */
export interface EffectiveSetting {
  value: any;
  source: SettingScope;           // Woher kommt der aktuelle Wert?
  inheritedFrom?: SettingScope;   // Falls vererbt: ursprüngliche Quelle
  isLocked: boolean;              // Kann nicht überschrieben werden
  isDefault: boolean;             // Ist der Default-Wert
  definition: SettingDefinition;  // Metadaten der Einstellung
}

/**
 * Alle effektiven Einstellungen für ein Modul
 */
export interface EffectiveSettings {
  [key: string]: EffectiveSetting;
}

/**
 * Kontext für Settings-Auflösung (Benutzerkontext)
 */
export interface SettingsContext {
  userId: string;
  roleId?: string;
  teamId?: string;
  departmentId?: string;
  locationId?: string;
  companyId?: string;
}

/**
 * Ergebnis einer Berechtigungsprüfung
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason: string;
  settingKey: string;
  settingValue: any;
  source: SettingScope;
}

/**
 * Audit-Log-Eintrag für Einstellungsänderungen
 */
export interface SettingsAuditLogEntry {
  id: string;
  settingValueId: string;
  module: string;
  key: string;
  oldValue: any;
  newValue: any;
  scope: SettingScope;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  reason?: string;
}

/**
 * Modul-spezifische Settings-Konfiguration
 */
export interface ModuleSettingsConfig {
  module: string;
  displayName: string;
  description: string;
  icon: string;
  settings: SettingDefinition[];
}

/**
 * Priorität der Scope-Ebenen (höher = höhere Priorität)
 */
export const SCOPE_PRIORITY: Record<SettingScopeLevel, number> = {
  global: 0,
  company: 1,
  location: 2,
  department: 3,
  team: 4,
  role: 5,
  user: 6
};

/**
 * Hilfsfunktion: Prüft ob Scope A höhere Priorität hat als Scope B
 */
export const hasScopeHigherPriority = (scopeA: SettingScopeLevel, scopeB: SettingScopeLevel): boolean => {
  return SCOPE_PRIORITY[scopeA] > SCOPE_PRIORITY[scopeB];
};
