import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Settings2, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  Briefcase,
  BarChart3,
  Shield,
  DollarSign,
  UserPlus,
  GitBranch,
  Building2,
  TrendingUp,
  BookOpen,
  MessageSquare,
  HelpCircle,
  CheckCircle,
  RotateCcw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface ModulePermission {
  id?: string;
  role: string;
  module_name: string;
  is_visible: boolean;
  allowed_actions: string[];
}

interface ModuleConfig {
  key: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'core' | 'hr' | 'planning' | 'admin';
}

const MODULES: ModuleConfig[] = [
  // Core-Module
  { key: 'dashboard', name: 'Dashboard', description: 'Übersicht und Kennzahlen', icon: BarChart3, category: 'core' },
  { key: 'calendar', name: 'Kalender', description: 'Termine und Ereignisse', icon: Calendar, category: 'core' },
  { key: 'tasks', name: 'Aufgaben', description: 'Aufgabenverwaltung', icon: CheckCircle, category: 'core' },
  { key: 'projects', name: 'Projekte', description: 'Projektverwaltung', icon: Briefcase, category: 'core' },
  { key: 'documents', name: 'Dokumente', description: 'Dokumentenverwaltung', icon: FileText, category: 'core' },
  { key: 'chat', name: 'Chat', description: 'Interne Kommunikation', icon: MessageSquare, category: 'core' },
  { key: 'knowledge', name: 'Wissensdatenbank', description: 'Wiki und Dokumentation', icon: BookOpen, category: 'core' },
  { key: 'helpdesk', name: 'HR Helpdesk', description: 'Support-Tickets', icon: HelpCircle, category: 'core' },
  
  // HR-Module
  { key: 'employees', name: 'Mitarbeiter', description: 'Mitarbeiterverwaltung', icon: Users, category: 'hr' },
  { key: 'absence', name: 'Abwesenheit', description: 'Urlaub und Krankmeldungen', icon: Calendar, category: 'hr' },
  { key: 'time_tracking', name: 'Zeiterfassung', description: 'Arbeitszeiten erfassen', icon: Clock, category: 'hr' },
  { key: 'performance', name: 'Performance', description: 'Leistungsbeurteilung', icon: TrendingUp, category: 'hr' },
  { key: 'recruiting', name: 'Recruiting', description: 'Bewerbermanagement', icon: UserPlus, category: 'hr' },
  { key: 'onboarding', name: 'Onboarding', description: 'Einarbeitungsprozesse', icon: Users, category: 'hr' },
  
  // Planung & Finanzen
  { key: 'payroll', name: 'Lohn & Gehalt', description: 'Gehaltsabrechnung', icon: DollarSign, category: 'planning' },
  { key: 'budget', name: 'Budget', description: 'Budgetplanung', icon: DollarSign, category: 'planning' },
  { key: 'workforce_planning', name: 'Workforce Planning', description: 'Personalplanung', icon: Users, category: 'planning' },
  { key: 'reports', name: 'Berichte', description: 'Auswertungen und Reports', icon: BarChart3, category: 'planning' },
  
  // Admin-Module
  { key: 'hr_organization_design', name: 'Organisationsdesign', description: 'Organisationsstruktur', icon: Building2, category: 'admin' },
  { key: 'compliance', name: 'Compliance Hub', description: 'Compliance-Management', icon: Shield, category: 'admin' },
  { key: 'workflow', name: 'Workflows', description: 'Automatisierungen', icon: GitBranch, category: 'admin' },
];

const ROLES = [
  { key: 'employee', name: 'Mitarbeiter', color: 'bg-blue-500' },
  { key: 'team_lead', name: 'Teamleiter', color: 'bg-green-500' },
  { key: 'hr_admin', name: 'HR Admin', color: 'bg-purple-500' },
  { key: 'admin', name: 'Admin', color: 'bg-orange-500' },
];

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Kern-Module',
  hr: 'HR-Module',
  planning: 'Planung & Finanzen',
  admin: 'Administration',
};

export const ModuleVisibilitySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [changes, setChanges] = useState<Record<string, ModulePermission>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Lade existierende Berechtigungen
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['module-visibility-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permission_matrix')
        .select('*')
        .in('role', ROLES.map(r => r.key));

      if (error) throw error;
      return data as ModulePermission[];
    },
  });

  // Mutation zum Speichern
  const saveMutation = useMutation({
    mutationFn: async (changedPermissions: ModulePermission[]) => {
      for (const perm of changedPermissions) {
        const { error } = await supabase
          .from('role_permission_matrix')
          .upsert({
            role: perm.role,
            module_name: perm.module_name,
            is_visible: perm.is_visible,
            allowed_actions: perm.allowed_actions,
          }, {
            onConflict: 'role,module_name',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Berechtigungen gespeichert');
      setChanges({});
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['module-visibility-settings'] });
      queryClient.invalidateQueries({ queryKey: ['module-visibility'] });
    },
    onError: (error) => {
      toast.error('Fehler beim Speichern: ' + (error as Error).message);
    },
  });

  // Prüfe ob Modul für Rolle sichtbar ist
  const isVisible = (moduleKey: string, role: string): boolean => {
    const changeKey = `${role}-${moduleKey}`;
    if (changes[changeKey] !== undefined) {
      return changes[changeKey].is_visible;
    }

    const existing = permissions.find(
      p => p.role === role && 
        (p.module_name === moduleKey || p.module_name.toLowerCase() === moduleKey.toLowerCase())
    );
    return existing?.is_visible ?? true;
  };

  // Toggle Sichtbarkeit
  const toggleVisibility = (moduleKey: string, role: string) => {
    const changeKey = `${role}-${moduleKey}`;
    const currentVisible = isVisible(moduleKey, role);
    
    const existing = permissions.find(
      p => p.role === role && 
        (p.module_name === moduleKey || p.module_name.toLowerCase() === moduleKey.toLowerCase())
    );

    setChanges(prev => ({
      ...prev,
      [changeKey]: {
        role,
        module_name: moduleKey,
        is_visible: !currentVisible,
        allowed_actions: existing?.allowed_actions || ['view'],
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Speichern
  const handleSave = () => {
    const changedPermissions = Object.values(changes);
    if (changedPermissions.length > 0) {
      saveMutation.mutate(changedPermissions);
    }
  };

  // Zurücksetzen
  const handleReset = () => {
    setChanges({});
    setHasUnsavedChanges(false);
  };

  // Gruppiere Module nach Kategorie
  const modulesByCategory = MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Modul-Sichtbarkeit nach Rolle
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie, welche Module für welche Rollen sichtbar sind. 
                SuperAdmin und Admin sehen immer alle Module.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Ungespeicherte Änderungen
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Zurücksetzen
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Rollen-Legende */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b">
            <span className="text-sm text-muted-foreground">Rollen:</span>
            {ROLES.map(role => (
              <Badge key={role.key} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))}
          </div>

          {/* Module nach Kategorie */}
          <div className="space-y-8">
            {Object.entries(modulesByCategory).map(([category, modules]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr,repeat(4,80px)] gap-2 items-center py-2 px-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Modul</span>
                    {ROLES.map(role => (
                      <span key={role.key} className="text-xs text-center text-muted-foreground">
                        {role.name}
                      </span>
                    ))}
                  </div>
                  
                  {/* Module */}
                  {modules.map(module => {
                    const IconComponent = module.icon;
                    return (
                      <div 
                        key={module.key}
                        className="grid grid-cols-[1fr,repeat(4,80px)] gap-2 items-center py-3 px-3 hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{module.name}</span>
                            <p className="text-xs text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        {ROLES.map(role => {
                          const visible = isVisible(module.key, role.key);
                          return (
                            <div key={role.key} className="flex justify-center">
                              <button
                                onClick={() => toggleVisibility(module.key, role.key)}
                                className={`p-2 rounded-lg transition-colors ${
                                  visible 
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                                }`}
                                title={visible ? 'Sichtbar' : 'Versteckt'}
                              >
                                {visible ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info-Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Hinweis zur Sicherheit</h4>
              <p className="text-sm text-blue-800 mt-1">
                Diese Einstellungen steuern nur die Sichtbarkeit der Module in der Navigation. 
                Die tatsächlichen Datenzugriffe werden zusätzlich durch Row-Level-Security (RLS) 
                in der Datenbank abgesichert.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleVisibilitySettings;
