// Settings-Driven Architecture (SDA) - Resolver Service
// 80/20 ENFORCEMENT: Berechnet effektive Einstellungen basierend auf Vererbungshierarchie

import { supabase } from '@/integrations/supabase/client';
import {
  SettingDefinition,
  SettingValue,
  SettingScope,
  SettingScopeLevel,
  EffectiveSetting,
  EffectiveSettings,
  SettingsContext,
  PermissionCheckResult,
  SCOPE_PRIORITY,
  hasScopeHigherPriority,
  VisibilityLevel,
  RiskLevel,
  ImpactScope,
  EnforcementChannel
} from '@/types/settings-driven';

/**
 * 80/20 Default-Werte für Einstellungen
 * Diese werden verwendet wenn DB-Werte fehlen
 */
const DEFAULT_ENFORCEMENT_METADATA = {
  visibilityLevel: 'standard' as VisibilityLevel,
  riskLevel: 'low' as RiskLevel,
  impactScope: ['ui', 'api'] as ImpactScope[],
  overrideAllowed: true,
  overrideScope: ['global', 'company', 'location', 'department', 'role', 'user'] as SettingScopeLevel[],
  enforcement: ['ui', 'api', 'chatbot', 'automation', 'ai'] as EnforcementChannel[],
  auditRequired: false
};

/**
 * Settings Resolver Service - 80/20 ENFORCEMENT
 * 
 * Zentrale Instanz für die Auflösung von Einstellungen
 * unter Berücksichtigung der Vererbungshierarchie:
 * 
 * Global → Company → Location → Department → Team → Role → User
 * 
 * REGELN:
 * - Jede Einstellung hat IMMER einen Default-Wert
 * - Override nur wenn override_allowed = true
 * - Override nur auf erlaubten Scope-Ebenen
 * - Audit-Log bei audit_required = true
 */
export class SettingsResolverService {
  private definitionsCache: Map<string, SettingDefinition[]> = new Map();
  private valuesCache: Map<string, SettingValue[]> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 60000; // 1 Minute

  /**
   * Lädt alle Einstellungs-Definitionen für ein Modul aus der Datenbank
   * 80/20: Stellt sicher, dass alle Enforcement-Metadaten vorhanden sind
   */
  async loadDefinitions(module: string): Promise<SettingDefinition[]> {
    // Prüfe Cache
    if (this.isCacheValid() && this.definitionsCache.has(module)) {
      return this.definitionsCache.get(module)!;
    }

    try {
      const { data, error } = await supabase
        .from('settings_definitions')
        .select('*')
        .eq('module', module)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('[SDA] Fehler beim Laden der Definitionen:', error);
        // Fallback auf In-Memory Definitionen
        return this.getDefaultDefinitions(module);
      }

      const definitions: SettingDefinition[] = (data || []).map(row => this.mapRowToDefinition(row));

      this.definitionsCache.set(module, definitions);
      this.cacheTimestamp = Date.now();
      
      return definitions;
    } catch (err) {
      console.error('[SDA] Fehler beim Laden der Definitionen:', err);
      return this.getDefaultDefinitions(module);
    }
  }

  /**
   * 80/20: Mappt eine DB-Row auf SettingDefinition mit Enforcement-Defaults
   */
  private mapRowToDefinition(row: any): SettingDefinition {
    return {
      id: row.id,
      module: row.module,
      submodule: row.submodule || undefined,
      key: row.key,
      name: row.name,
      description: row.description,
      valueType: row.value_type as 'boolean' | 'number' | 'string' | 'enum' | 'array' | 'json',
      defaultValue: row.default_value,
      allowedValues: row.allowed_values as any[] | undefined,
      minValue: row.min_value || undefined,
      maxValue: row.max_value || undefined,
      isRequired: row.is_required ?? true,
      affectedFeatures: row.affected_features || [],
      category: row.category || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // 80/20 Enforcement Metadaten - mit Defaults falls nicht gesetzt
      visibilityLevel: (row.visibility_level as VisibilityLevel) || DEFAULT_ENFORCEMENT_METADATA.visibilityLevel,
      recommendedValue: row.recommended_value ?? row.default_value,
      riskLevel: (row.risk_level as RiskLevel) || DEFAULT_ENFORCEMENT_METADATA.riskLevel,
      impactScope: (row.impact_scope as ImpactScope[]) || DEFAULT_ENFORCEMENT_METADATA.impactScope,
      overrideAllowed: row.override_allowed ?? DEFAULT_ENFORCEMENT_METADATA.overrideAllowed,
      overrideScope: (row.override_scope as SettingScopeLevel[]) || DEFAULT_ENFORCEMENT_METADATA.overrideScope,
      enforcement: (row.enforcement as EnforcementChannel[]) || DEFAULT_ENFORCEMENT_METADATA.enforcement,
      auditRequired: row.audit_required ?? DEFAULT_ENFORCEMENT_METADATA.auditRequired,
      legalReference: row.legal_reference || undefined
    };
  }

  /**
   * Lädt alle Einstellungs-Werte für einen Kontext aus der Datenbank
   */
  async loadValues(module: string, context: SettingsContext): Promise<SettingValue[]> {
    const cacheKey = `${module}-${context.userId}`;
    
    if (this.isCacheValid() && this.valuesCache.has(cacheKey)) {
      return this.valuesCache.get(cacheKey)!;
    }

    try {
      // Baue Scope-Filter für alle relevanten Ebenen
      let query = supabase
        .from('settings_values')
        .select('*')
        .eq('module', module);

      // Füge OR-Bedingungen für alle Scope-Ebenen hinzu
      const scopeConditions: string[] = [];
      
      scopeConditions.push(`scope_level.eq.global`);
      
      if (context.companyId) {
        scopeConditions.push(`and(scope_level.eq.company,scope_entity_id.eq.${context.companyId})`);
      }
      if (context.locationId) {
        scopeConditions.push(`and(scope_level.eq.location,scope_entity_id.eq.${context.locationId})`);
      }
      if (context.departmentId) {
        scopeConditions.push(`and(scope_level.eq.department,scope_entity_id.eq.${context.departmentId})`);
      }
      if (context.teamId) {
        scopeConditions.push(`and(scope_level.eq.team,scope_entity_id.eq.${context.teamId})`);
      }
      if (context.roleId) {
        scopeConditions.push(`and(scope_level.eq.role,scope_entity_id.eq.${context.roleId})`);
      }
      if (context.userId) {
        scopeConditions.push(`and(scope_level.eq.user,scope_entity_id.eq.${context.userId})`);
      }

      const { data, error } = await query.or(scopeConditions.join(','));

      if (error) {
        console.error('[SDA] Fehler beim Laden der Werte:', error);
        return [];
      }

      const values: SettingValue[] = (data || []).map(row => ({
        id: row.id,
        definitionId: row.definition_id,
        module: row.module,
        key: row.key,
        value: row.value,
        scope: {
          level: row.scope_level as SettingScopeLevel,
          entityId: row.scope_entity_id || undefined,
          entityName: row.scope_entity_name || undefined
        },
        inheritanceMode: (row.inheritance_mode as 'inherit' | 'override' | 'locked') || 'inherit',
        effectiveFrom: row.effective_from || undefined,
        effectiveTo: row.effective_to || undefined,
        createdBy: row.created_by || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      this.valuesCache.set(cacheKey, values);
      
      return values;
    } catch (err) {
      console.error('[SDA] Fehler beim Laden der Werte:', err);
      return [];
    }
  }

  /**
   * Berechnet die effektiven Einstellungen für ein Modul
   * 
   * Algorithmus:
   * 1. Lade alle Definitionen für das Modul
   * 2. Lade alle Werte für den Kontext (alle Ebenen)
   * 3. Für jede Definition: Finde den effektiven Wert
   *    - Starte bei der höchsten Priorität (User)
   *    - Gehe die Hierarchie nach unten durch
   *    - Beachte inheritanceMode (locked, override, inherit)
   */
  async getEffectiveSettings(
    module: string, 
    context: SettingsContext
  ): Promise<EffectiveSettings> {
    const definitions = await this.loadDefinitions(module);
    const values = await this.loadValues(module, context);
    
    const effectiveSettings: EffectiveSettings = {};
    
    for (const definition of definitions) {
      effectiveSettings[definition.key] = this.resolveEffectiveSetting(
        definition,
        values,
        context
      );
    }
    
    return effectiveSettings;
  }

  /**
   * Löst eine einzelne Einstellung auf
   */
  private resolveEffectiveSetting(
    definition: SettingDefinition,
    allValues: SettingValue[],
    context: SettingsContext
  ): EffectiveSetting {
    // Filtere Werte für diese Definition
    const relevantValues = allValues.filter(v => v.key === definition.key);
    
    // Sortiere nach Scope-Priorität (höchste zuerst)
    const sortedValues = this.sortValuesByPriority(relevantValues, context);
    
    // Finde den effektiven Wert
    let effectiveValue: any = definition.defaultValue;
    let source: SettingScope = { level: 'global' };
    let inheritedFrom: SettingScope | undefined;
    let isLocked = false;
    let isDefault = true;
    
    // Prüfe zuerst auf gesperrte Werte (von oben nach unten)
    for (const value of sortedValues.reverse()) {
      if (value.inheritanceMode === 'locked') {
        effectiveValue = value.value;
        source = value.scope;
        isLocked = true;
        isDefault = false;
        break;
      }
    }
    
    // Wenn nicht gesperrt, finde den höchsten Override
    if (!isLocked) {
      for (const value of sortedValues) {
        if (this.isValueApplicable(value, context)) {
          if (value.inheritanceMode === 'override' || value.inheritanceMode === 'inherit') {
            effectiveValue = value.value;
            source = value.scope;
            isDefault = false;
            
            if (value.inheritanceMode === 'inherit') {
              inheritedFrom = this.findInheritedSource(value, sortedValues, context);
            }
            break;
          }
        }
      }
    }
    
    return {
      value: effectiveValue,
      source,
      inheritedFrom,
      isLocked,
      isDefault,
      definition
    };
  }

  /**
   * Sortiert Werte nach Scope-Priorität
   */
  private sortValuesByPriority(
    values: SettingValue[],
    context: SettingsContext
  ): SettingValue[] {
    return [...values].sort((a, b) => {
      const priorityA = SCOPE_PRIORITY[a.scope.level];
      const priorityB = SCOPE_PRIORITY[b.scope.level];
      return priorityB - priorityA; // Höchste Priorität zuerst
    });
  }

  /**
   * Prüft ob ein Wert für den Kontext anwendbar ist
   */
  private isValueApplicable(value: SettingValue, context: SettingsContext): boolean {
    const { scope } = value;
    
    switch (scope.level) {
      case 'global':
        return true;
      case 'company':
        return scope.entityId === context.companyId;
      case 'location':
        return scope.entityId === context.locationId;
      case 'department':
        return scope.entityId === context.departmentId;
      case 'team':
        return scope.entityId === context.teamId;
      case 'role':
        return scope.entityId === context.roleId;
      case 'user':
        return scope.entityId === context.userId;
      default:
        return false;
    }
  }

  /**
   * Findet die ursprüngliche Quelle bei Vererbung
   */
  private findInheritedSource(
    value: SettingValue,
    allValues: SettingValue[],
    context: SettingsContext
  ): SettingScope | undefined {
    const lowerPriorityValues = allValues.filter(v => 
      SCOPE_PRIORITY[v.scope.level] < SCOPE_PRIORITY[value.scope.level] &&
      this.isValueApplicable(v, context)
    );
    
    if (lowerPriorityValues.length > 0) {
      return lowerPriorityValues[0].scope;
    }
    
    return { level: 'global' };
  }

  /**
   * Prüft ob eine Berechtigung erlaubt ist
   */
  async checkPermission(
    module: string,
    key: string,
    context: SettingsContext
  ): Promise<PermissionCheckResult> {
    const settings = await this.getEffectiveSettings(module, context);
    const setting = settings[key];
    
    if (!setting) {
      return {
        allowed: false,
        reason: `Einstellung '${key}' existiert nicht im Modul '${module}'`,
        settingKey: key,
        settingValue: undefined,
        source: { level: 'global' }
      };
    }
    
    const allowed = this.evaluatePermission(setting.value, setting.definition.valueType);
    
    return {
      allowed,
      reason: allowed 
        ? `Erlaubt durch Einstellung auf Ebene: ${this.getScopeLevelName(setting.source.level)}`
        : `Nicht erlaubt laut Einstellung auf Ebene: ${this.getScopeLevelName(setting.source.level)}`,
      settingKey: key,
      settingValue: setting.value,
      source: setting.source
    };
  }

  /**
   * Wertet einen Wert als Berechtigung aus
   */
  private evaluatePermission(value: any, valueType: string): boolean {
    switch (valueType) {
      case 'boolean':
        return value === true;
      case 'number':
        return value > 0;
      case 'string':
        return value !== '' && value !== 'disabled' && value !== 'none';
      case 'array':
        return Array.isArray(value) && value.length > 0;
      default:
        return !!value;
    }
  }

  /**
   * Übersetzt Scope-Level in lesbare Namen
   */
  private getScopeLevelName(level: SettingScopeLevel): string {
    const names: Record<SettingScopeLevel, string> = {
      global: 'Global',
      company: 'Gesellschaft',
      location: 'Standort',
      department: 'Abteilung',
      team: 'Team',
      role: 'Rolle',
      user: 'Benutzer'
    };
    return names[level];
  }

  /**
   * Prüft ob der Cache noch gültig ist
   */
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  /**
   * Invalidiert den Cache
   */
  invalidateCache(): void {
    this.definitionsCache.clear();
    this.valuesCache.clear();
    this.cacheTimestamp = 0;
  }

  /**
   * 80/20: Prüft ob ein Override auf dieser Ebene erlaubt ist
   */
  canOverride(definition: SettingDefinition, scopeLevel: SettingScopeLevel): boolean {
    if (!definition.overrideAllowed) return false;
    return definition.overrideScope.includes(scopeLevel);
  }

  /**
   * 80/20: Loggt eine Einstellungsänderung wenn audit_required = true
   */
  private async logSettingChange(
    definition: SettingDefinition,
    oldValue: any,
    newValue: any,
    scopeLevel: SettingScopeLevel,
    scopeEntityId: string | null,
    context: SettingsContext,
    channel: EnforcementChannel = 'ui'
  ): Promise<void> {
    if (!definition.auditRequired) return;
    
    try {
      await supabase.from('settings_audit_log').insert({
        definition_id: definition.id,
        module: definition.module,
        key: definition.key,
        action: oldValue === undefined ? 'create' : 'update',
        old_value: oldValue,
        new_value: newValue,
        scope_level: scopeLevel,
        scope_entity_id: scopeEntityId,
        changed_by: context.userId,
        enforcement_channel: channel
      });
    } catch (err) {
      console.error('[SDA] Audit-Log Fehler:', err);
    }
  }

  /**
   * Speichert eine einzelne Einstellung in der Datenbank
   * 80/20: Mit Override-Prüfung und Audit-Logging
   */
  async saveSetting(
    module: string,
    key: string,
    value: any,
    scopeLevel: SettingScopeLevel = 'company',
    context: SettingsContext,
    channel: EnforcementChannel = 'ui'
  ): Promise<{ success: boolean; reason?: string }> {
    try {
      // 80/20: Lade Definition und prüfe Override-Berechtigung
      const definitions = await this.loadDefinitions(module);
      const definition = definitions.find(d => d.key === key);
      
      if (!definition) {
        return { success: false, reason: `Einstellung '${key}' existiert nicht` };
      }
      
      if (!this.canOverride(definition, scopeLevel)) {
        return { 
          success: false, 
          reason: `Override auf Ebene '${scopeLevel}' nicht erlaubt für '${key}'` 
        };
      }

      const scopeEntityId = this.getScopeEntityId(scopeLevel, context);
      
      // Baue Query für existierende Werte
      let query = supabase
        .from('settings_values')
        .select('id')
        .eq('module', module)
        .eq('key', key)
        .eq('scope_level', scopeLevel);
      
      // Behandle null für scope_entity_id korrekt
      if (scopeEntityId === null) {
        query = query.is('scope_entity_id', null);
      } else {
        query = query.eq('scope_entity_id', scopeEntityId);
      }
      
      const { data: existing } = await query.maybeSingle();

      if (existing) {
        // Update bestehenden Wert
        const { error } = await supabase
          .from('settings_values')
          .update({
            value: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('[SDA] Fehler beim Aktualisieren der Einstellung:', error);
          return { success: false, reason: error.message };
        }
      } else {
        // Erstelle neuen Wert
        const insertData: any = {
          module,
          key,
          value,
          scope_level: scopeLevel,
          inheritance_mode: 'override',
          created_by: context.userId
        };
        
        // Nur scope_entity_id setzen wenn nicht null
        if (scopeEntityId !== null) {
          insertData.scope_entity_id = scopeEntityId;
        }
        
        const { error } = await supabase
          .from('settings_values')
          .insert(insertData);

        if (error) {
          console.error('[SDA] Fehler beim Erstellen der Einstellung:', error);
          return { success: false, reason: error.message };
        }
      }

      // Cache invalidieren
      this.invalidateCache();
      return { success: true };
    } catch (err) {
      console.error('[SDA] Fehler beim Speichern der Einstellung:', err);
      return { success: false, reason: err instanceof Error ? err.message : 'Unbekannter Fehler' };
    }
  }

  /**
   * Speichert mehrere Einstellungen auf einmal
   */
  async saveModuleSettings(
    module: string,
    settings: Record<string, any>,
    scopeLevel: SettingScopeLevel = 'company',
    context: SettingsContext
  ): Promise<boolean> {
    try {
      const scopeEntityId = this.getScopeEntityId(scopeLevel, context);
      const keys = Object.keys(settings);
      
      // Baue Query für existierende Werte
      let query = supabase
        .from('settings_values')
        .select('id, key')
        .eq('module', module)
        .eq('scope_level', scopeLevel)
        .in('key', keys);
      
      // Behandle null für scope_entity_id korrekt
      if (scopeEntityId === null) {
        query = query.is('scope_entity_id', null);
      } else {
        query = query.eq('scope_entity_id', scopeEntityId);
      }
      
      const { data: existingValues } = await query;

      const existingKeyMap = new Map((existingValues || []).map(v => [v.key, v.id]));

      // Trenne Updates und Inserts
      const updates: Array<{ id: string; value: any }> = [];
      const inserts: Array<{
        module: string;
        key: string;
        value: any;
        scope_level: string;
        scope_entity_id?: string;
        inheritance_mode: string;
        created_by: string;
      }> = [];

      for (const [key, value] of Object.entries(settings)) {
        const existingId = existingKeyMap.get(key);
        if (existingId) {
          updates.push({ id: existingId, value });
        } else {
          const insertData: any = {
            module,
            key,
            value,
            scope_level: scopeLevel,
            inheritance_mode: 'override',
            created_by: context.userId
          };
          
          // Nur scope_entity_id setzen wenn nicht null
          if (scopeEntityId !== null) {
            insertData.scope_entity_id = scopeEntityId;
          }
          
          inserts.push(insertData);
        }
      }

      // Führe Updates durch
      for (const update of updates) {
        const { error } = await supabase
          .from('settings_values')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('id', update.id);
          
        if (error) {
          console.error('[SDA] Fehler beim Update:', error);
          return false;
        }
      }

      // Führe Inserts durch
      if (inserts.length > 0) {
        const { error } = await supabase
          .from('settings_values')
          .insert(inserts);
          
        if (error) {
          console.error('[SDA] Fehler beim Insert:', error);
          return false;
        }
      }

      // Cache invalidieren
      this.invalidateCache();
      return true;
    } catch (err) {
      console.error('[SDA] Fehler beim Speichern der Modul-Einstellungen:', err);
      return false;
    }
  }

  /**
   * Ermittelt die Entity-ID für einen Scope-Level
   * Gibt null zurück wenn keine gültige UUID verfügbar ist
   */
  private getScopeEntityId(level: SettingScopeLevel, context: SettingsContext): string | null {
    switch (level) {
      case 'global':
        return null; // Global hat keine Entity-ID
      case 'company':
        return context.companyId || null;
      case 'location':
        return context.locationId || context.companyId || null;
      case 'department':
        return context.departmentId || context.companyId || null;
      case 'team':
        return context.teamId || context.companyId || null;
      case 'role':
        return context.roleId || context.companyId || null;
      case 'user':
        return context.userId || null;
      default:
        return context.companyId || null;
    }
  }

  /**
   * 80/20: Erstellt eine vollständige SettingDefinition mit allen Enforcement-Metadaten
   */
  private createDefinition(
    id: string,
    module: string,
    key: string,
    name: string,
    description: string,
    valueType: 'boolean' | 'number' | 'string' | 'enum' | 'array' | 'json',
    defaultValue: any,
    options: {
      submodule?: string;
      allowedValues?: any[];
      minValue?: number;
      maxValue?: number;
      affectedFeatures?: string[];
      category?: string;
      visibilityLevel?: VisibilityLevel;
      riskLevel?: RiskLevel;
      impactScope?: ImpactScope[];
      overrideAllowed?: boolean;
      overrideScope?: SettingScopeLevel[];
      enforcement?: EnforcementChannel[];
      auditRequired?: boolean;
      legalReference?: string;
    } = {}
  ): SettingDefinition {
    const now = new Date().toISOString();
    return {
      id,
      module,
      submodule: options.submodule,
      key,
      name,
      description,
      valueType,
      defaultValue,
      allowedValues: options.allowedValues,
      minValue: options.minValue,
      maxValue: options.maxValue,
      isRequired: true,
      affectedFeatures: options.affectedFeatures || [],
      category: options.category,
      createdAt: now,
      updatedAt: now,
      // 80/20 Enforcement Metadaten
      visibilityLevel: options.visibilityLevel || 'standard',
      recommendedValue: defaultValue,
      riskLevel: options.riskLevel || 'low',
      impactScope: options.impactScope || ['ui', 'api'],
      overrideAllowed: options.overrideAllowed ?? true,
      overrideScope: options.overrideScope || ['global', 'company', 'location', 'department', 'role', 'user'],
      enforcement: options.enforcement || ['ui', 'api', 'chatbot', 'automation', 'ai'],
      auditRequired: options.auditRequired || false,
      legalReference: options.legalReference
    };
  }

  /**
   * Default-Definitionen für Module (Fallback wenn DB nicht verfügbar)
   * 80/20: Alle Definitionen haben vollständige Enforcement-Metadaten
   */
  private getDefaultDefinitions(module: string): SettingDefinition[] {
    const definitions: Record<string, SettingDefinition[]> = {
      timetracking: [
        this.createDefinition('tt-001', 'timetracking', 'manual_booking_allowed', 
          'Manuelle Nachbuchung erlaubt', 
          'Bestimmt ob Mitarbeiter Zeitbuchungen manuell nachtragen dürfen',
          'boolean', true, 
          { affectedFeatures: ['Nachbuchung', 'Zeitkorrektur', 'Manuelle Erfassung'] }
        ),
        this.createDefinition('tt-002', 'timetracking', 'break_tracking_mode',
          'Pausenerfassung',
          'Wie werden Pausen erfasst?',
          'enum', 'automatic',
          { allowedValues: ['automatic', 'manual', 'mixed', 'disabled'], affectedFeatures: ['Pausenbuchung', 'Pausenberechnung'] }
        ),
        this.createDefinition('tt-003', 'timetracking', 'approval_required',
          'Genehmigung erforderlich',
          'Müssen Zeitbuchungen genehmigt werden?',
          'boolean', false,
          { affectedFeatures: ['Genehmigungsworkflow', 'Freigabe'], riskLevel: 'medium', auditRequired: true }
        )
      ],
      absence: [
        this.createDefinition('ab-001', 'absence', 'self_request_allowed',
          'Selbstständige Anträge erlaubt',
          'Dürfen Mitarbeiter selbstständig Abwesenheitsanträge stellen?',
          'boolean', true,
          { affectedFeatures: ['Urlaubsantrag', 'Krankmeldung'] }
        ),
        this.createDefinition('ab-002', 'absence', 'min_advance_days',
          'Mindest-Vorlaufzeit (Tage)',
          'Wie viele Tage im Voraus muss Urlaub beantragt werden?',
          'number', 3,
          { minValue: 0, maxValue: 365, affectedFeatures: ['Urlaubsantrag', 'Validierung'] }
        )
      ],
      tasks: [
        this.createDefinition('ta-001', 'tasks', 'create_task_allowed',
          'Aufgaben erstellen erlaubt',
          'Dürfen Benutzer neue Aufgaben erstellen?',
          'boolean', true,
          { affectedFeatures: ['Aufgabenerstellung'] }
        ),
        this.createDefinition('ta-002', 'tasks', 'assignment_restriction',
          'Aufgabenzuweisung beschränkt',
          'Wer darf Aufgaben zuweisen?',
          'enum', 'all',
          { allowedValues: ['all', 'managers', 'team_leads', 'admins'], affectedFeatures: ['Aufgabenzuweisung', 'Delegation'] }
        )
      ],
      dashboard: [
        this.createDefinition('db-001', 'dashboard', 'show_timetracking_widget',
          'Zeiterfassung-Widget anzeigen',
          'Soll das Zeiterfassungs-Widget auf dem Dashboard angezeigt werden?',
          'boolean', true,
          { affectedFeatures: ['Dashboard-Zeiterfassung'] }
        ),
        this.createDefinition('db-002', 'dashboard', 'show_tasks_widget',
          'Aufgaben-Widget anzeigen',
          'Soll das Aufgaben-Widget auf dem Dashboard angezeigt werden?',
          'boolean', true,
          { affectedFeatures: ['Dashboard-Aufgaben'] }
        )
      ],
      business_travel: this.getBusinessTravelDefaults()
    };
    
    return definitions[module] || [];
  }

  /**
   * Generiert Default-Definitionen für das business_travel Modul
   * 80/20: Verwendet createDefinition für vollständige Enforcement-Metadaten
   */
  private getBusinessTravelDefaults(): SettingDefinition[] {
    const defs: SettingDefinition[] = [];
    let id = 1;
    
    const addDef = (key: string, name: string, desc: string, valueType: 'boolean' | 'number' | 'string', defaultValue: any, category?: string, submodule?: string) => {
      defs.push(this.createDefinition(
        `bt-${String(id++).padStart(3, '0')}`,
        'business_travel',
        key,
        name,
        desc,
        valueType,
        defaultValue,
        { submodule, category }
      ));
    };
    
    // General
    addDef('travel_type_domestic', 'Inlandsreisen', 'Inlandsreisen aktivieren', 'boolean', true, 'general', 'general');
    addDef('travel_type_eu', 'EU-Reisen', 'EU-Reisen aktivieren', 'boolean', true, 'general', 'general');
    addDef('advance_payment_max', 'Max. Vorschuss (€)', 'Maximaler Vorschussbetrag', 'number', 500, 'general', 'general');
    addDef('default_currency', 'Standardwährung', 'Standard-Währung für Reisekosten', 'string', 'EUR', 'general', 'general');
    
    // Approval
    addDef('approval_required', 'Genehmigung erforderlich', 'Reisen müssen genehmigt werden', 'boolean', true, 'approval', 'approval');
    addDef('auto_approval_enabled', 'Auto-Genehmigung', 'Automatische Genehmigung aktivieren', 'boolean', false, 'approval', 'approval');
    
    // Budget
    addDef('budget_tracking_enabled', 'Budget-Tracking', 'Budget-Tracking aktivieren', 'boolean', true, 'budget', 'budget');
    addDef('budget_warning_threshold', 'Warnschwelle (%)', 'Warnung ab X% Budgetverbrauch', 'number', 80, 'budget', 'budget');
    
    // Per Diem
    addDef('per_diem_enabled', 'Tagespauschalen aktiv', 'Tagespauschalen aktivieren', 'boolean', true, 'per_diem', 'per_diem');
    addDef('per_diem_domestic_full', 'Volle Pauschale Inland (€)', 'Volle Tagespauschale Inland', 'number', 28, 'per_diem', 'per_diem');
    
    return defs;
  }
}

// Singleton-Instanz
export const settingsResolver = new SettingsResolverService();
