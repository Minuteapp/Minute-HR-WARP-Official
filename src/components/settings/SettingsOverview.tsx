// Settings-Driven Architecture (SDA) - Settings Overview
// Übersicht aller aktiven Einstellungen

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings2, 
  Search, 
  Filter,
  Lock,
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

interface SettingDefinitionRow {
  id: string;
  module: string;
  submodule: string | null;
  key: string;
  name: string;
  description: string;
  value_type: string;
  default_value: any;
  category: string | null;
  is_active: boolean;
  affected_features: string[] | null;
}

interface SettingValueRow {
  id: string;
  definition_id: string;
  module: string;
  key: string;
  value: any;
  scope_level: SettingScopeLevel;
  scope_entity_name: string | null;
  inheritance_mode: string;
}

const SCOPE_ICONS: Record<SettingScopeLevel, React.ElementType> = {
  global: Globe,
  company: Building2,
  location: MapPin,
  department: Users,
  team: Users,
  role: Shield,
  user: User
};

const MODULE_LABELS: Record<string, string> = {
  timetracking: 'Zeiterfassung',
  absence: 'Abwesenheit',
  tasks: 'Aufgaben',
  dashboard: 'Dashboard',
  ai: 'KI-Funktionen'
};

export const SettingsOverview: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  // Lade alle Definitionen
  const { data: definitions, isLoading: loadingDefs } = useQuery({
    queryKey: ['allSettingsDefinitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings_definitions')
        .select('*')
        .eq('is_active', true)
        .order('module')
        .order('sort_order');

      if (error) {
        console.error('[SDA] Fehler beim Laden der Definitionen:', error);
        return [];
      }

      return data as SettingDefinitionRow[];
    }
  });

  // Lade alle Werte (Global-Ebene)
  const { data: values, isLoading: loadingValues } = useQuery({
    queryKey: ['allSettingsValues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings_values')
        .select('*')
        .eq('scope_level', 'global');

      if (error) {
        console.error('[SDA] Fehler beim Laden der Werte:', error);
        return [];
      }

      return data as SettingValueRow[];
    }
  });

  const isLoading = loadingDefs || loadingValues;

  // Filtere und gruppiere Definitionen
  const filteredDefinitions = definitions?.filter(def => {
    const matchesSearch = 
      def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModule = selectedModule === 'all' || def.module === selectedModule;
    
    return matchesSearch && matchesModule;
  }) || [];

  const groupedByModule = filteredDefinitions.reduce((acc, def) => {
    if (!acc[def.module]) {
      acc[def.module] = [];
    }
    acc[def.module].push(def);
    return acc;
  }, {} as Record<string, SettingDefinitionRow[]>);

  const getValueForKey = (key: string): SettingValueRow | undefined => {
    return values?.find(v => v.key === key);
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Ja' : 'Nein';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const modules = [...new Set(definitions?.map(d => d.module) || [])];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Einstellungsübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Einstellungen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Modul filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Module</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>
                  {MODULE_LABELS[module] || module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Lade Einstellungen...</div>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-6">
              {Object.entries(groupedByModule).map(([module, defs]) => (
                <div key={module}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    {MODULE_LABELS[module] || module}
                    <Badge variant="secondary">{defs.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    {defs.map(def => {
                      const value = getValueForKey(def.key);
                      const effectiveValue = value?.value ?? def.default_value;
                      const ScopeIcon = value ? SCOPE_ICONS[value.scope_level] : Globe;
                      const isDefault = !value;
                      const isLocked = value?.inheritance_mode === 'locked';

                      return (
                        <div
                          key={def.id}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{def.name}</span>
                              {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
                              {isDefault && (
                                <Badge variant="outline" className="text-xs">Standard</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {def.description}
                            </p>
                            {def.affected_features && def.affected_features.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {def.affected_features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                typeof effectiveValue === 'boolean'
                                  ? effectiveValue
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {typeof effectiveValue === 'boolean' ? (
                                effectiveValue ? (
                                  <><Check className="h-3 w-3 mr-1" />Ja</>
                                ) : (
                                  <><X className="h-3 w-3 mr-1" />Nein</>
                                )
                              ) : (
                                formatValue(effectiveValue)
                              )}
                            </Badge>
                            <ScopeIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredDefinitions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Einstellungen gefunden
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsOverview;
