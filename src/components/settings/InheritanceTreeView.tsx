// Settings-Driven Architecture (SDA) - Inheritance Tree View
// Visualisiert die Vererbungshierarchie einer Einstellung

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GitBranch, 
  Lock, 
  ArrowDown, 
  Globe, 
  Building2, 
  MapPin, 
  Users, 
  User, 
  Shield,
  Check,
  X
} from 'lucide-react';
import { SettingScopeLevel } from '@/types/settings-driven';

interface SettingValue {
  id: string;
  key: string;
  value: any;
  scope_level: SettingScopeLevel;
  scope_entity_id: string | null;
  scope_entity_name: string | null;
  inheritance_mode: 'inherit' | 'override' | 'locked';
}

interface SettingDefinition {
  id: string;
  module: string;
  key: string;
  name: string;
  default_value: any;
}

const SCOPE_ORDER: SettingScopeLevel[] = ['global', 'company', 'location', 'department', 'team', 'role', 'user'];

const SCOPE_ICONS: Record<SettingScopeLevel, React.ElementType> = {
  global: Globe,
  company: Building2,
  location: MapPin,
  department: Users,
  team: Users,
  role: Shield,
  user: User
};

const SCOPE_NAMES: Record<SettingScopeLevel, string> = {
  global: 'Global',
  company: 'Gesellschaft',
  location: 'Standort',
  department: 'Abteilung',
  team: 'Team',
  role: 'Rolle',
  user: 'Benutzer'
};

interface InheritanceTreeViewProps {
  module?: string;
}

export const InheritanceTreeView: React.FC<InheritanceTreeViewProps> = ({ module }) => {
  const [selectedModule, setSelectedModule] = useState<string>(module || 'timetracking');
  const [selectedKey, setSelectedKey] = useState<string>('');

  // Lade alle Definitionen
  const { data: definitions } = useQuery({
    queryKey: ['settingsDefinitions', selectedModule],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings_definitions')
        .select('id, module, key, name, default_value')
        .eq('module', selectedModule)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('[SDA] Fehler beim Laden der Definitionen:', error);
        return [];
      }

      return data as SettingDefinition[];
    }
  });

  // Lade alle Werte für die ausgewählte Einstellung
  const { data: values } = useQuery({
    queryKey: ['settingsValues', selectedModule, selectedKey],
    queryFn: async () => {
      if (!selectedKey) return [];

      const { data, error } = await supabase
        .from('settings_values')
        .select('id, key, value, scope_level, scope_entity_id, scope_entity_name, inheritance_mode')
        .eq('module', selectedModule)
        .eq('key', selectedKey)
        .order('scope_level');

      if (error) {
        console.error('[SDA] Fehler beim Laden der Werte:', error);
        return [];
      }

      return data as SettingValue[];
    },
    enabled: !!selectedKey
  });

  const selectedDefinition = definitions?.find(d => d.key === selectedKey);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Ja' : 'Nein';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const getInheritanceBadge = (mode: string) => {
    switch (mode) {
      case 'locked':
        return <Badge className="bg-amber-100 text-amber-700"><Lock className="h-3 w-3 mr-1" />Gesperrt</Badge>;
      case 'override':
        return <Badge className="bg-blue-100 text-blue-700">Überschrieben</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700"><ArrowDown className="h-3 w-3 mr-1" />Geerbt</Badge>;
    }
  };

  // Gruppiere Werte nach Scope-Level
  const groupedValues = SCOPE_ORDER.reduce((acc, level) => {
    acc[level] = values?.filter(v => v.scope_level === level) || [];
    return acc;
  }, {} as Record<SettingScopeLevel, SettingValue[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Vererbungshierarchie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Modul wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timetracking">Zeiterfassung</SelectItem>
              <SelectItem value="absence">Abwesenheit</SelectItem>
              <SelectItem value="tasks">Aufgaben</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="ai">KI-Funktionen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Einstellung wählen" />
            </SelectTrigger>
            <SelectContent>
              {definitions?.map(def => (
                <SelectItem key={def.key} value={def.key}>
                  {def.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedKey && selectedDefinition && (
          <div className="space-y-2">
            {/* Default-Wert */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border-l-4 border-slate-400">
              <Globe className="h-5 w-5 text-slate-500" />
              <div className="flex-1">
                <div className="font-medium">Standardwert</div>
                <div className="text-sm text-muted-foreground">
                  Definiert in der Einstellungsdefinition
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {formatValue(selectedDefinition.default_value)}
              </Badge>
            </div>

            {/* Vererbungskette */}
            {SCOPE_ORDER.map((level, idx) => {
              const scopeValues = groupedValues[level];
              const ScopeIcon = SCOPE_ICONS[level];
              const hasValues = scopeValues.length > 0;

              return (
                <React.Fragment key={level}>
                  {idx > 0 && (
                    <div className="flex justify-center">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div 
                    className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
                      hasValues 
                        ? 'bg-blue-50 border-blue-400' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <ScopeIcon className={`h-5 w-5 ${hasValues ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{SCOPE_NAMES[level]}</div>
                      {hasValues ? (
                        <div className="space-y-1 mt-1">
                          {scopeValues.map(val => (
                            <div key={val.id} className="flex items-center gap-2 text-sm">
                              {val.scope_entity_name && (
                                <span className="text-muted-foreground">{val.scope_entity_name}:</span>
                              )}
                              <span className="font-medium">{formatValue(val.value)}</span>
                              {getInheritanceBadge(val.inheritance_mode)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Keine Überschreibung auf dieser Ebene
                        </div>
                      )}
                    </div>
                    {hasValues ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground/30" />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {!selectedKey && (
          <div className="text-center py-8 text-muted-foreground">
            Wählen Sie eine Einstellung aus, um die Vererbungshierarchie zu sehen
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InheritanceTreeView;
