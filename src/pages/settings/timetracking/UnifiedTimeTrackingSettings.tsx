import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { 
  Clock, 
  Building2, 
  Scale, 
  Bot, 
  ShieldCheck,
  Settings2
} from 'lucide-react';
import { 
  UnifiedSettingsContainer,
  SettingsPermissionGuard,
  SettingsImpactDisplay,
  ScopeSelector
} from '@/components/settings/unified';
import { useUnifiedSettings } from '@/hooks/useUnifiedSettings';
import { 
  ModuleSettingsConfig, 
  SettingsContainer, 
  SettingsScope,
  SettingsRole,
  ContainerMeta,
  SettingDefinition
} from '@/types/unified-settings';

// Container 1: Grundlagen
const grundlagenContainer: SettingsContainer = {
  meta: {
    type: 'grundlagen',
    title: 'Grundlagen',
    description: 'Aktivierung und Basiskonfiguration der Zeiterfassung',
    icon: Clock,
    order: 1
  },
  settings: [
    {
      id: 'time_tracking_enabled',
      key: 'time_tracking_enabled',
      label: 'Zeiterfassung aktiv',
      description: 'Aktiviert die Zeiterfassungsfunktion für alle Mitarbeiter',
      tooltip: 'Wenn deaktiviert, können keine Zeiten erfasst werden',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false,
      isRecommended: true,
      affectedModules: ['Dashboard', 'Berichte', 'Lohnabrechnung']
    },
    {
      id: 'default_work_hours',
      key: 'default_work_hours',
      label: 'Standard-Arbeitsstunden pro Tag',
      type: 'number',
      defaultValue: 8,
      isAdvanced: false,
      isRecommended: true,
      validation: { min: 1, max: 24 }
    },
    {
      id: 'booking_method',
      key: 'booking_method',
      label: 'Buchungsmethode',
      description: 'Wie Mitarbeiter ihre Zeiten erfassen',
      type: 'select',
      defaultValue: 'all',
      isAdvanced: false,
      options: [
        { value: 'terminal', label: 'Nur Terminal' },
        { value: 'app', label: 'Nur App' },
        { value: 'manual', label: 'Nur manuell' },
        { value: 'all', label: 'Alle Methoden' }
      ]
    },
    {
      id: 'round_to_minutes',
      key: 'round_to_minutes',
      label: 'Auf Minuten runden',
      tooltip: 'Buchungen werden auf diese Minutenzahl gerundet',
      type: 'select',
      defaultValue: '1',
      isAdvanced: true,
      options: [
        { value: '1', label: 'Keine Rundung' },
        { value: '5', label: '5 Minuten' },
        { value: '15', label: '15 Minuten' },
        { value: '30', label: '30 Minuten' }
      ]
    },
    {
      id: 'allow_future_bookings',
      key: 'allow_future_bookings',
      label: 'Zukünftige Buchungen erlauben',
      type: 'switch',
      defaultValue: false,
      isAdvanced: true
    }
  ]
};

// Container 2: Organisation
const organisationContainer: SettingsContainer = {
  meta: {
    type: 'organisation',
    title: 'Organisation',
    description: 'Standort- und abteilungsspezifische Einstellungen',
    icon: Building2,
    order: 2
  },
  settings: [
    {
      id: 'location_specific_rules',
      key: 'location_specific_rules',
      label: 'Standortspezifische Regeln aktivieren',
      description: 'Erlaubt unterschiedliche Einstellungen pro Standort',
      type: 'switch',
      defaultValue: false,
      isAdvanced: false,
      affectedModules: ['Standortverwaltung']
    },
    {
      id: 'department_overrides',
      key: 'department_overrides',
      label: 'Abteilungs-Ausnahmen zulassen',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false
    },
    {
      id: 'team_flex_time',
      key: 'team_flex_time',
      label: 'Teams können Gleitzeit anpassen',
      type: 'switch',
      defaultValue: false,
      isAdvanced: true
    },
    {
      id: 'inherit_parent_settings',
      key: 'inherit_parent_settings',
      label: 'Von übergeordneter Ebene erben',
      tooltip: 'Nicht definierte Einstellungen werden von der übergeordneten Ebene übernommen',
      type: 'switch',
      defaultValue: true,
      isAdvanced: true
    }
  ]
};

// Container 3: Regeln & Logik
const regelnContainer: SettingsContainer = {
  meta: {
    type: 'regeln',
    title: 'Regeln & Logik',
    description: 'Gesetzliche Vorgaben und fachliche Regeln',
    icon: Scale,
    order: 3
  },
  settings: [
    {
      id: 'enforce_break_rules',
      key: 'enforce_break_rules',
      label: 'Pausenregeln durchsetzen',
      description: 'Gemäß Arbeitszeitgesetz (6h = 30min, 9h = 45min Pause)',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false,
      isRecommended: true,
      affectedModules: ['Compliance', 'Berichte']
    },
    {
      id: 'max_daily_hours',
      key: 'max_daily_hours',
      label: 'Maximale Arbeitszeit pro Tag (Stunden)',
      tooltip: 'Gemäß ArbZG max. 10 Stunden',
      type: 'number',
      defaultValue: 10,
      isAdvanced: false,
      validation: { min: 8, max: 12 }
    },
    {
      id: 'overtime_threshold',
      key: 'overtime_threshold',
      label: 'Überstunden-Schwelle (Stunden)',
      type: 'number',
      defaultValue: 8,
      isAdvanced: false,
      validation: { min: 1, max: 12 }
    },
    {
      id: 'require_project_booking',
      key: 'require_project_booking',
      label: 'Projektbuchung erforderlich',
      description: 'Zeiten müssen einem Projekt zugeordnet werden',
      type: 'switch',
      defaultValue: false,
      isAdvanced: true,
      affectedModules: ['Projekte']
    },
    {
      id: 'min_rest_period',
      key: 'min_rest_period',
      label: 'Mindestruhezeit zwischen Schichten (Stunden)',
      tooltip: 'Gesetzlich: mind. 11 Stunden',
      type: 'number',
      defaultValue: 11,
      isAdvanced: true,
      isRecommended: true,
      validation: { min: 9, max: 14 }
    }
  ]
};

// Container 4: Automatisierung & KI
const automatisierungContainer: SettingsContainer = {
  meta: {
    type: 'automatisierung',
    title: 'Automatisierung & KI',
    description: 'KI-gestützte Vorschläge und Automatisierungen',
    icon: Bot,
    order: 4
  },
  settings: [
    {
      id: 'ai_booking_suggestions',
      key: 'ai_booking_suggestions',
      label: 'KI-Buchungsvorschläge',
      description: 'Basierend auf Mustern werden Buchungen vorgeschlagen',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false,
      affectedModules: ['KI-Assistent']
    },
    {
      id: 'auto_break_detection',
      key: 'auto_break_detection',
      label: 'Automatische Pausenerkennung',
      description: 'Pausen werden automatisch erkannt und vorgeschlagen',
      type: 'switch',
      defaultValue: false,
      isAdvanced: false
    },
    {
      id: 'smart_reminders',
      key: 'smart_reminders',
      label: 'Intelligente Erinnerungen',
      description: 'Erinnerungen basierend auf Arbeitsmustern',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false
    },
    {
      id: 'ai_explainability',
      key: 'ai_explainability',
      label: 'KI-Erklärpflicht aktivieren',
      tooltip: 'KI-Entscheidungen müssen begründet werden',
      type: 'switch',
      defaultValue: true,
      isAdvanced: true,
      isRecommended: true
    },
    {
      id: 'auto_correction_suggestions',
      key: 'auto_correction_suggestions',
      label: 'Automatische Korrekturvorschläge',
      type: 'switch',
      defaultValue: false,
      isAdvanced: true
    }
  ]
};

// Container 5: Kontrolle & Governance
const kontrolleContainer: SettingsContainer = {
  meta: {
    type: 'kontrolle',
    title: 'Kontrolle & Governance',
    description: 'Freigaben, Audit und Eskalationen',
    icon: ShieldCheck,
    order: 5
  },
  settings: [
    {
      id: 'require_approval',
      key: 'require_approval',
      label: 'Genehmigungspflicht',
      description: 'Buchungen erfordern Vorgesetzten-Freigabe',
      type: 'select',
      defaultValue: 'overtime_only',
      isAdvanced: false,
      affectedModules: ['Genehmigungen', 'Benachrichtigungen'],
      options: [
        { value: 'none', label: 'Keine Genehmigung' },
        { value: 'overtime_only', label: 'Nur bei Überstunden' },
        { value: 'corrections', label: 'Bei Korrekturen' },
        { value: 'all', label: 'Alle Buchungen' }
      ]
    },
    {
      id: 'audit_trail_enabled',
      key: 'audit_trail_enabled',
      label: 'Audit-Trail aktivieren',
      description: 'Alle Änderungen werden protokolliert',
      type: 'switch',
      defaultValue: true,
      isAdvanced: false,
      isRecommended: true
    },
    {
      id: 'escalation_rules',
      key: 'escalation_rules',
      label: 'Eskalationsregeln',
      type: 'select',
      defaultValue: '48h',
      isAdvanced: false,
      options: [
        { value: 'none', label: 'Keine Eskalation' },
        { value: '24h', label: 'Nach 24 Stunden' },
        { value: '48h', label: 'Nach 48 Stunden' },
        { value: '72h', label: 'Nach 72 Stunden' }
      ]
    },
    {
      id: 'compliance_warnings',
      key: 'compliance_warnings',
      label: 'Compliance-Warnungen anzeigen',
      type: 'switch',
      defaultValue: true,
      isAdvanced: true
    },
    {
      id: 'data_retention_days',
      key: 'data_retention_days',
      label: 'Datenaufbewahrung (Tage)',
      tooltip: 'Gesetzliche Anforderung: mind. 2 Jahre',
      type: 'number',
      defaultValue: 730,
      isAdvanced: true,
      validation: { min: 365, max: 3650 }
    }
  ]
};

// Complete Time Tracking Settings Config
const timeTrackingConfig: ModuleSettingsConfig = {
  moduleId: 'time_tracking',
  moduleName: 'Zeiterfassung',
  moduleIcon: Clock,
  containers: [
    grundlagenContainer,
    organisationContainer,
    regelnContainer,
    automatisierungContainer,
    kontrolleContainer
  ]
};

interface UnifiedTimeTrackingSettingsProps {
  userRole?: SettingsRole;
}

export function UnifiedTimeTrackingSettings({ 
  userRole = 'hr_admin' 
}: UnifiedTimeTrackingSettingsProps) {
  const [currentScope, setCurrentScope] = useState<SettingsScope>('global');
  const [scopeId, setScopeId] = useState<string>();

  const {
    visibleContainers,
    showAdvanced,
    expandedContainers,
    pendingChange,
    isConfirmDialogOpen,
    getStandardSettings,
    getAdvancedSettings,
    toggleAdvanced,
    toggleContainer,
    getValue,
    handleChange,
    confirmPendingChange,
    cancelPendingChange,
    resetContainer,
    isModified
  } = useUnifiedSettings({
    moduleId: 'time_tracking',
    containers: timeTrackingConfig.containers,
    userRole,
    currentScope,
    scopeId
  });

  const handleScopeChange = (scope: SettingsScope, id?: string) => {
    setCurrentScope(scope);
    setScopeId(id);
  };

  // Leere Scopes - werden aus der Datenbank geladen
  const availableScopes = {
    standorte: [],
    abteilungen: [],
    teams: []
  };

  return (
    <TooltipProvider>
      <SettingsPermissionGuard userRole={userRole} requiredRole="team_leader">
        <div className="space-y-6">
          {/* Module Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Zeiterfassung</h2>
              <p className="text-sm text-muted-foreground">
                Einstellungen für die Arbeitszeiterfassung
              </p>
            </div>
          </div>

          {/* Scope Selector */}
          <ScopeSelector
            currentScope={currentScope}
            scopeId={scopeId}
            onScopeChange={handleScopeChange}
            availableScopes={availableScopes}
          />

          {/* Settings Containers */}
          <div className="space-y-4">
            {visibleContainers.map((container) => (
              <UnifiedSettingsContainer
                key={container.meta.type}
                container={container}
                standardSettings={getStandardSettings(container)}
                advancedSettings={getAdvancedSettings(container)}
                showAdvanced={showAdvanced[container.meta.type] ?? false}
                isExpanded={expandedContainers[container.meta.type] ?? true}
                onToggleAdvanced={() => toggleAdvanced(container.meta.type)}
                onToggleExpand={() => toggleContainer(container.meta.type)}
                onReset={() => resetContainer(container)}
                getValue={getValue}
                onChange={handleChange}
                isModified={isModified}
              />
            ))}
          </div>

          {/* Impact Confirmation Dialog */}
          <SettingsImpactDisplay
            pendingChange={pendingChange}
            isOpen={isConfirmDialogOpen}
            onConfirm={confirmPendingChange}
            onCancel={cancelPendingChange}
          />
        </div>
      </SettingsPermissionGuard>
    </TooltipProvider>
  );
}

export default UnifiedTimeTrackingSettings;
