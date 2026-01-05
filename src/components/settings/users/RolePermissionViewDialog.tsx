import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X, Eye, Plus, Pencil, Trash2, CheckCircle, Download, Users, FolderOpen } from 'lucide-react';

interface RolePermission {
  id: string;
  role: string;
  module_name: string;
  is_visible: boolean;
  allowed_actions: string[];
}

interface PermissionModule {
  id: string;
  module_key: string;
  name: string;
  module_type: string;
  parent_module_id: string | null;
  is_active: boolean;
}

interface RolePermissionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  view: <Eye className="h-3 w-3" />,
  create: <Plus className="h-3 w-3" />,
  edit: <Pencil className="h-3 w-3" />,
  delete: <Trash2 className="h-3 w-3" />,
  approve: <CheckCircle className="h-3 w-3" />,
  export: <Download className="h-3 w-3" />
};

const ACTION_LABELS: Record<string, string> = {
  view: 'Anzeigen',
  create: 'Erstellen',
  edit: 'Bearbeiten',
  delete: 'Löschen',
  approve: 'Genehmigen',
  export: 'Exportieren'
};

// Mapping für bessere Anzeigenamen
const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  dashboard: 'Dashboard',
  calendar: 'Kalender',
  documents: 'Dokumente',
  chat: 'Chat',
  notifications: 'Benachrichtigungen',
  absence: 'Abwesenheit',
  time_tracking: 'Zeiterfassung',
  payroll: 'Lohn & Gehalt',
  performance: 'Performance',
  goals: 'Ziele',
  training: 'Weiterbildung',
  surveys: 'Umfragen',
  shift_planning: 'Schichtplanung',
  rewards: 'Rewards',
  onboarding: 'Onboarding',
  recruiting: 'Recruiting',
  global_mobility: 'Global Mobility',
  workforce_planning: 'Personalplanung',
  business_travel: 'Dienstreisen',
  projects: 'Projekte',
  innovation: 'Innovation',
  fleet: 'Fuhrpark',
  assets: 'Assets',
  budget: 'Budget',
  expenses: 'Spesen',
  company_cards: 'Firmenkarten',
  helpdesk: 'Helpdesk',
  knowledge_hub: 'Knowledge Hub',
  settings: 'Einstellungen',
  reports: 'Berichte',
  compliance: 'Compliance',
  organization_design: 'Organisationsdesign',
  workflow: 'Workflow',
  ai_hub: 'AI Hub'
};

export const RolePermissionViewDialog: React.FC<RolePermissionViewDialogProps> = ({
  open,
  onOpenChange,
  roleId,
  roleName
}) => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && roleId) {
      loadData();
    }
  }, [open, roleId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Lade Module und Berechtigungen parallel
      const [permissionsResult, modulesResult] = await Promise.all([
        supabase
          .from('role_permission_matrix')
          .select('*')
          .eq('role', roleId),
        supabase
          .from('permission_modules')
          .select('*')
          .eq('is_active', true)
          .order('module_key')
      ]);

      if (permissionsResult.error) throw permissionsResult.error;
      if (modulesResult.error) throw modulesResult.error;

      setPermissions(permissionsResult.data || []);
      setModules(modulesResult.data || []);
    } catch (err) {
      console.error('Fehler beim Laden:', err);
      setError('Fehler beim Laden der Berechtigungen');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionForModule = (moduleKey: string): RolePermission | undefined => {
    return permissions.find(p => p.module_name === moduleKey);
  };

  const getDisplayName = (module: PermissionModule): string => {
    return DISPLAY_NAME_OVERRIDES[module.module_key] || module.name || module.module_key;
  };

  // Gruppiere Module nach Typ
  const groupedModules = React.useMemo(() => {
    const employeeModules = modules.filter(m => m.module_key.startsWith('employee_'));
    const mainModules = modules.filter(m => m.module_type === 'module' && !m.module_key.startsWith('employee_'));
    const subModules = modules.filter(m => m.module_type === 'submodule' && !m.module_key.startsWith('employee_'));
    const otherModules = modules.filter(m => 
      !m.module_key.startsWith('employee_') && 
      m.module_type !== 'module' && 
      m.module_type !== 'submodule'
    );

    return {
      employee: { name: 'Mitarbeiter-Module', icon: Users, modules: employeeModules },
      main: { name: 'Hauptmodule', icon: FolderOpen, modules: mainModules },
      sub: { name: 'Untermodule', icon: FolderOpen, modules: subModules },
      other: { name: 'Weitere', icon: FolderOpen, modules: otherModules }
    };
  }, [modules]);

  const renderModulePermission = (module: PermissionModule) => {
    const permission = getPermissionForModule(module.module_key);
    const moduleLabel = getDisplayName(module);

    if (!permission) {
      return (
        <div key={module.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground">{moduleLabel}</span>
          <Badge variant="outline" className="text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Nicht konfiguriert
          </Badge>
        </div>
      );
    }

    const isVisible = permission.is_visible;
    const actions = permission.allowed_actions || [];

    return (
      <div 
        key={module.id} 
        className={`flex items-center justify-between p-3 rounded-lg border ${
          isVisible ? 'bg-background' : 'bg-muted/30 opacity-60'
        }`}
      >
        <div className="flex items-center gap-2">
          {isVisible ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={`text-sm font-medium ${!isVisible ? 'text-muted-foreground' : ''}`}>
            {moduleLabel}
          </span>
          <span className="text-xs text-muted-foreground">({module.module_key})</span>
        </div>
        
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {isVisible ? (
            actions.length > 0 ? (
              actions.map(action => (
                <Badge 
                  key={action} 
                  variant="secondary" 
                  className="text-xs flex items-center gap-1"
                >
                  {ACTION_ICONS[action]}
                  {ACTION_LABELS[action] || action}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs">Nur sichtbar</Badge>
            )
          ) : (
            <Badge variant="outline" className="text-muted-foreground text-xs">Kein Zugriff</Badge>
          )}
        </div>
      </div>
    );
  };

  const countVisibleModules = (moduleList: PermissionModule[]) => {
    const visibleCount = moduleList.filter(m => getPermissionForModule(m.module_key)?.is_visible).length;
    return `${visibleCount}/${moduleList.length}`;
  };

  // Filtere leere Kategorien raus
  const visibleCategories = Object.entries(groupedModules).filter(([_, { modules }]) => modules.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Berechtigungen für Rolle:
            <Badge variant="default">{roleName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Übersicht aller Modul-Berechtigungen für diese Rolle ({modules.length} Module)
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : modules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Keine Module in der Datenbank gefunden
          </div>
        ) : (
          <ScrollArea className="h-[60vh]">
            <Tabs defaultValue={visibleCategories[0]?.[0] || 'main'} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
                {visibleCategories.map(([key, { name, modules: categoryModules }]) => (
                  <TabsTrigger key={key} value={key} className="text-xs flex-1 min-w-fit">
                    {name}
                    <Badge variant="outline" className="ml-1 text-xs">
                      {countVisibleModules(categoryModules)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {visibleCategories.map(([key, { modules: categoryModules }]) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="space-y-2">
                    {categoryModules.map(module => renderModulePermission(module))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Zusammenfassung */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Zusammenfassung</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Gesamte Module:</span>
                  <span className="ml-2 font-medium">{modules.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sichtbar:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {permissions.filter(p => p.is_visible).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Versteckt:</span>
                  <span className="ml-2 font-medium text-muted-foreground">
                    {permissions.filter(p => !p.is_visible).length}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Vollzugriff:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {permissions.filter(p => 
                      p.is_visible && 
                      p.allowed_actions?.includes('view') && 
                      p.allowed_actions?.includes('create') && 
                      p.allowed_actions?.includes('edit') && 
                      p.allowed_actions?.includes('delete')
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
