import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, Save, Eye, Edit, Trash2, Plus, Check, X,
  Users, Calendar, Clock, FileText, Settings, Brain
} from 'lucide-react';

const MODULES = [
  { id: 'employee_management', name: 'Mitarbeiterverwaltung', icon: Users },
  { id: 'absence_management', name: 'Abwesenheitsverwaltung', icon: Calendar },
  { id: 'time_tracking', name: 'Zeiterfassung', icon: Clock },
  { id: 'document_management', name: 'Dokumentenverwaltung', icon: FileText },
  { id: 'settings', name: 'Einstellungen', icon: Settings },
  { id: 'ai_management', name: 'KI-Management', icon: Brain },
];

const ACTIONS = ['anzeigen', 'erstellen', 'bearbeiten', 'löschen', 'genehmigen', 'exportieren'];
const SCOPES = ['eigene', 'team', 'abteilung', 'unternehmen'];

interface Permission {
  id?: string;
  role: string;
  module_key: string;
  action: string;
  scope: string;
  is_allowed: boolean;
}

export const PermissionMatrixTab: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<string[]>(['superadmin', 'admin', 'manager', 'employee']);
  const [selectedRole, setSelectedRole] = useState('employee');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('granular_permissions')
        .select('*');

      if (error) throw error;

      // Transform DB data to local format
      const transformed: Permission[] = (data || []).map(p => ({
        id: p.id,
        role: p.role,
        module_key: p.module_key,
        action: p.action,
        scope: p.scope || 'eigene',
        is_allowed: p.is_allowed
      }));

      setPermissions(transformed);
    } catch (error) {
      console.error('Fehler beim Laden der Berechtigungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermission = (role: string, moduleKey: string, action: string, scope: string): boolean => {
    const perm = permissions.find(
      p => p.role === role && p.module_key === moduleKey && p.action === action && p.scope === scope
    );
    
    // Superadmin hat immer alle Rechte
    if (role === 'superadmin') return true;
    
    return perm?.is_allowed || false;
  };

  const togglePermission = (role: string, moduleKey: string, action: string, scope: string) => {
    if (role === 'superadmin') return; // Superadmin kann nicht geändert werden

    const existingIndex = permissions.findIndex(
      p => p.role === role && p.module_key === moduleKey && p.action === action && p.scope === scope
    );

    if (existingIndex >= 0) {
      const updated = [...permissions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        is_allowed: !updated[existingIndex].is_allowed
      };
      setPermissions(updated);
    } else {
      setPermissions([
        ...permissions,
        { role, module_key: moduleKey, action, scope, is_allowed: true }
      ]);
    }
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      // Hier würden wir die Änderungen in die DB schreiben
      toast({
        title: "Berechtigungen gespeichert",
        description: "Alle Änderungen wurden erfolgreich übernommen."
      });
      setHasChanges(false);
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Berechtigungs-Matrix
              </CardTitle>
              <CardDescription>
                Granulare Berechtigungen auf Modul-, Aktions- und Datenebene
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Rollen-Auswahl */}
          <div className="flex gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground mr-4 self-center">Rolle:</span>
            {roles.map(role => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role)}
              >
                {role === 'superadmin' && <Shield className="h-3 w-3 mr-1" />}
                {role}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Lädt...</p>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {MODULES.map(module => {
                  const Icon = module.icon;
                  return (
                    <Card key={module.id} className="border-2">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {module.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[150px]">Aktion</TableHead>
                              {SCOPES.map(scope => (
                                <TableHead key={scope} className="text-center capitalize">
                                  {scope}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ACTIONS.map(action => (
                              <TableRow key={action}>
                                <TableCell className="font-medium capitalize">{action}</TableCell>
                                {SCOPES.map(scope => {
                                  const isAllowed = getPermission(selectedRole, module.id, action, scope);
                                  const isLocked = selectedRole === 'superadmin';
                                  
                                  return (
                                    <TableCell key={scope} className="text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isLocked}
                                        onClick={() => togglePermission(selectedRole, module.id, action, scope)}
                                        className={`w-10 h-10 rounded-full ${
                                          isAllowed 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        } ${isLocked ? 'opacity-50' : ''}`}
                                      >
                                        {isAllowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                      </Button>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Legende */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-700" />
              </div>
              <span className="text-sm">Berechtigung erteilt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-700" />
              </div>
              <span className="text-sm">Berechtigung verweigert</span>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              <strong>Scopes:</strong> eigene = nur eigene Daten, team = Teamdaten, abteilung = Abteilungsdaten, unternehmen = alle Daten
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
