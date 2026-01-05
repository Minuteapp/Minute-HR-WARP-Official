import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  Eye, Play, Users, Check, X, AlertTriangle, Shield, 
  RefreshCw, Info
} from 'lucide-react';

interface EffectivePermission {
  module: string;
  submodule: string;
  action: string;
  scope: string;
  allowed: boolean;
  source: string;
}

interface ConflictWarning {
  id: string;
  type: 'conflict' | 'overlap' | 'gap' | 'info';
  severity: 'warning' | 'error' | 'info';
  message: string;
  affected: string[];
}

export const PreviewSimulationTab: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('employee');
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  // Lade Module aus der Datenbank
  const { data: modules } = useQuery({
    queryKey: ['system-modules'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return [];

      // Hole aktivierte Module für die Company
      const { data: companyModules } = await supabase
        .from('module_settings')
        .select('module_name, is_enabled')
        .eq('company_id', profile.company_id);

      if (!companyModules || companyModules.length === 0) {
        // Fallback: Standard-Module
        return [
          { id: 'employee_management', name: 'Mitarbeiterverwaltung', submodules: ['employees', 'departments', 'teams'] },
          { id: 'absence_management', name: 'Abwesenheitsverwaltung', submodules: ['requests', 'calendar', 'balances'] },
          { id: 'time_tracking', name: 'Zeiterfassung', submodules: ['entries', 'projects', 'overtime'] },
          { id: 'budget', name: 'Budgetverwaltung', submodules: ['planning', 'expenses', 'reports'] },
          { id: 'settings', name: 'Einstellungen', submodules: ['general', 'users', 'integrations'] },
        ];
      }

      return companyModules
        .filter(m => m.is_enabled)
        .map(m => ({
          id: m.module_name.toLowerCase().replace(/\s+/g, '_'),
          name: m.module_name,
          submodules: ['anzeigen', 'bearbeiten']
        }));
    }
  });

  // Lade Rollen aus der Datenbank
  const { data: roles } = useQuery({
    queryKey: ['system-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return ['employee'];

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return ['employee'];

      // Hole definierte Rollen
      const { data: companyRoles } = await supabase
        .from('roles')
        .select('name')
        .eq('company_id', profile.company_id);

      if (!companyRoles || companyRoles.length === 0) {
        return ['superadmin', 'admin', 'hr_manager', 'manager', 'employee'];
      }

      return companyRoles.map(r => r.name);
    }
  });

  const displayModules = modules || [];
  const displayRoles = roles || ['employee'];

  const calculateEffectivePermissions = (role: string): EffectivePermission[] => {
    const permissions: EffectivePermission[] = [];
    
    displayModules.forEach(module => {
      (module.submodules || []).forEach(sub => {
        ['anzeigen', 'erstellen', 'bearbeiten', 'löschen', 'genehmigen'].forEach(action => {
          ['eigene', 'team', 'abteilung', 'unternehmen'].forEach(scope => {
            let allowed = false;
            let source = 'Standard';

            if (role === 'superadmin') {
              allowed = true;
              source = 'Superadmin (alle Rechte)';
            } else if (role === 'admin') {
              allowed = true;
              source = 'Admin-Rolle';
            } else if (role === 'hr_manager') {
              allowed = module.id.includes('employee') || module.id.includes('absence');
              source = allowed ? 'HR Manager Vorlage' : 'Nicht berechtigt';
            } else if (role === 'manager') {
              allowed = action === 'anzeigen' || (scope === 'team' && action !== 'löschen');
              source = allowed ? 'Manager-Rolle' : 'Eingeschränkt';
            } else {
              allowed = action === 'anzeigen' && scope === 'eigene';
              source = allowed ? 'Mitarbeiter-Basis' : 'Nicht berechtigt';
            }

            permissions.push({
              module: module.name,
              submodule: sub,
              action,
              scope,
              allowed,
              source
            });
          });
        });
      });
    });

    return permissions;
  };

  const checkForConflicts = (role: string): ConflictWarning[] => {
    const warnings: ConflictWarning[] = [];

    if (role === 'manager') {
      warnings.push({
        id: '1',
        type: 'overlap',
        severity: 'warning',
        message: 'Die Rolle "Manager" hat Genehmigungsrechte, aber keine Löschrechte. Dies könnte zu Inkonsistenzen führen.',
        affected: ['Abwesenheitsverwaltung', 'Zeiterfassung']
      });
    }

    if (role === 'employee') {
      warnings.push({
        id: '2',
        type: 'info',
        severity: 'info',
        message: 'Mitarbeiter können nur eigene Daten einsehen. Teamansichten sind nicht verfügbar.',
        affected: ['Alle Module']
      });
    }

    return warnings;
  };

  const handleSimulate = () => {
    setLoading(true);
    setSimulationActive(true);

    setTimeout(() => {
      setEffectivePermissions(calculateEffectivePermissions(selectedRole));
      setConflicts(checkForConflicts(selectedRole));
      setLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setSimulationActive(false);
    setEffectivePermissions([]);
    setConflicts([]);
  };

  const allowedCount = effectivePermissions.filter(p => p.allowed).length;
  const deniedCount = effectivePermissions.filter(p => !p.allowed).length;

  return (
    <div className="space-y-6">
      {/* Simulations-Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Rechte-Vorschau & Simulation
          </CardTitle>
          <CardDescription>
            Simulieren Sie, welche Berechtigungen eine Rolle oder ein Benutzer effektiv hat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Modus</Label>
              <Select defaultValue="role">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Zeige Rechte als Rolle</SelectItem>
                  <SelectItem value="user">Simuliere Benutzer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rolle auswählen</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={handleSimulate} disabled={loading} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Simulation starten
                </Button>
                {simulationActive && (
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Konflikte & Warnungen */}
      {conflicts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Konflikte & Hinweise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map(conflict => (
                <Alert 
                  key={conflict.id} 
                  className={
                    conflict.severity === 'error' ? 'border-red-300 bg-red-50' :
                    conflict.severity === 'warning' ? 'border-amber-300 bg-amber-50' :
                    'border-blue-300 bg-blue-50'
                  }
                >
                  {conflict.severity === 'error' ? (
                    <X className="h-4 w-4 text-red-600" />
                  ) : conflict.severity === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <AlertTitle className={
                    conflict.severity === 'error' ? 'text-red-800' :
                    conflict.severity === 'warning' ? 'text-amber-800' :
                    'text-blue-800'
                  }>
                    {conflict.type === 'conflict' ? 'Konflikt' : 
                     conflict.type === 'overlap' ? 'Überlappung' : 'Hinweis'}
                  </AlertTitle>
                  <AlertDescription className={
                    conflict.severity === 'error' ? 'text-red-700' :
                    conflict.severity === 'warning' ? 'text-amber-700' :
                    'text-blue-700'
                  }>
                    {conflict.message}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {conflict.affected.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ergebnis-Übersicht */}
      {simulationActive && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Berechtigt</p>
                    <p className="text-2xl font-bold text-green-600">{allowedCount}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nicht berechtigt</p>
                    <p className="text-2xl font-bold text-red-600">{deniedCount}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Konflikte</p>
                    <p className="text-2xl font-bold text-amber-600">{conflicts.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-amber-100">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detaillierte Berechtigungsmatrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Effektive Berechtigungen für: {selectedRole}
              </CardTitle>
              <CardDescription>
                Vollständige Auflistung aller Berechtigungen mit Herkunft
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modul</TableHead>
                      <TableHead>Bereich</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Quelle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {effectivePermissions.slice(0, 50).map((perm, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{perm.module}</TableCell>
                        <TableCell>{perm.submodule}</TableCell>
                        <TableCell className="capitalize">{perm.action}</TableCell>
                        <TableCell className="capitalize">{perm.scope}</TableCell>
                        <TableCell className="text-center">
                          {perm.allowed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Erlaubt
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Verweigert
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {perm.source}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* Anleitung wenn keine Simulation aktiv */}
      {!simulationActive && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Keine aktive Simulation</h3>
              <p className="text-muted-foreground mb-4">
                Wählen Sie eine Rolle aus und starten Sie die Simulation,
                um die effektiven Berechtigungen zu sehen.
              </p>
              <Button onClick={handleSimulate}>
                <Play className="h-4 w-4 mr-2" />
                Simulation starten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
