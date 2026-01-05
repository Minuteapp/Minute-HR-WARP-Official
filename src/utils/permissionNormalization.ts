/**
 * Zentrale Normalisierung für Modul-Keys und Action-Keys
 * Stellt sicher, dass Permission-Checks konsistent funktionieren,
 * unabhängig davon ob z.B. "knowledge-hub" oder "knowledge_hub" verwendet wird.
 */

// Modul-Aliases: verschiedene Schreibweisen → kanonischer Name
const MODULE_ALIASES: Record<string, string> = {
  // Bindestriche → Unterstriche
  'knowledge-hub': 'knowledge_hub',
  'business-travel': 'business_travel',
  'shift-planning': 'shift_planning',
  'sick-leave': 'sick_leave',
  'time-tracking': 'time_tracking',
  'hr-organization-design': 'hr_organization_design',
  'workforce-planning': 'workforce_planning',
  'pulse-surveys': 'pulse_surveys',
  'global-mobility': 'global_mobility',
  'remote-work': 'remote_work',
  
  // Deutsche Namen → englische Keys
  'zeiterfassung': 'time_tracking',
  'abwesenheit': 'absence',
  'mitarbeiter': 'employees',
  'aufgaben': 'tasks',
  'projekte': 'projects',
  'dokumente': 'documents',
  'kalender': 'calendar',
  'einstellungen': 'settings',
  'berichte': 'reports',
  'ziele': 'goals',
  'benutzer': 'users',
  'benachrichtigungen': 'notifications',
  'wissensdatenbank': 'knowledge_hub',
  'geschäftsreisen': 'business_travel',
  'schichtplanung': 'shift_planning',
  'krankmeldungen': 'sick_leave',
  'nachhaltigkeit': 'environment',
  'umfragen': 'pulse_surveys',
  'schulungen': 'training',
  
  // Varianten
  'timetracking': 'time_tracking',
  'time': 'time_tracking',
  'profile': 'profil',
  'lohn & gehalt': 'payroll',
  'lohn_&_gehalt': 'payroll',
  'lohn_gehalt': 'payroll',
  'payroll_settings': 'payroll',
  'employee_surveys': 'pulse_surveys',
  'surveys': 'pulse_surveys',
  'ai_hub': 'ai',
  'ki-funktionen': 'ai',
  'rewards': 'benefits',
};

// Action-Aliases: verschiedene Schreibweisen → kanonischer Name
const ACTION_ALIASES: Record<string, string> = {
  'read': 'view',
  'update': 'edit',
  'manage': 'edit', // "manage" wird oft geprüft, existiert aber nicht in DB
  'remove': 'delete',
  'write': 'edit',
  'modify': 'edit',
};

/**
 * Normalisiert einen Modul-Key für konsistente Permission-Checks
 * @param input Der Modul-Key (z.B. "knowledge-hub", "Zeiterfassung", etc.)
 * @returns Normalisierter Modul-Key (z.B. "knowledge_hub", "time_tracking")
 */
export function normalizeModuleKey(input: string): string {
  if (!input) return '';
  
  // Lowercase, trim, Bindestriche → Unterstriche
  let normalized = input.toLowerCase().trim().replace(/-/g, '_').replace(/\s+/g, '_');
  
  // Alias-Mapping anwenden
  if (MODULE_ALIASES[normalized]) {
    return MODULE_ALIASES[normalized];
  }
  
  // Auch Original (vor Underscore-Konvertierung) prüfen
  const originalLower = input.toLowerCase().trim();
  if (MODULE_ALIASES[originalLower]) {
    return MODULE_ALIASES[originalLower];
  }
  
  return normalized;
}

/**
 * Normalisiert einen Action-Key für konsistente Permission-Checks
 * @param input Die Action (z.B. "read", "manage", etc.)
 * @returns Normalisierte Action (z.B. "view", "edit")
 */
export function normalizeActionKey(input: string): string {
  if (!input) return '';
  
  const normalized = input.toLowerCase().trim();
  
  // Alias-Mapping anwenden
  if (ACTION_ALIASES[normalized]) {
    return ACTION_ALIASES[normalized];
  }
  
  return normalized;
}

/**
 * Prüft ob zwei Modul-Keys nach Normalisierung gleich sind
 */
export function moduleKeysMatch(key1: string, key2: string): boolean {
  return normalizeModuleKey(key1) === normalizeModuleKey(key2);
}

/**
 * Prüft ob zwei Action-Keys nach Normalisierung gleich sind
 */
export function actionKeysMatch(key1: string, key2: string): boolean {
  return normalizeActionKey(key1) === normalizeActionKey(key2);
}
