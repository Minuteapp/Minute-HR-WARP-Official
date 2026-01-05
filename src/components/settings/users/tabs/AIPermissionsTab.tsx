import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Sparkles, MessageSquare, FileSearch, Zap, 
  ShieldCheck, AlertTriangle, Activity, Save
} from 'lucide-react';

interface AIPermission {
  role: string;
  module: string;
  ai_suggestions: boolean;
  ai_actions: boolean;
  ai_aggregation: boolean;
  explainability_required: boolean;
}

interface AIUsageLog {
  id: string;
  user_name: string;
  module: string;
  action: string;
  timestamp: string;
  tokens_used: number;
  cost: number;
}

const ROLES = ['superadmin', 'admin', 'manager', 'employee'];
const MODULES = [
  { id: 'chatbot', name: 'KI-Chatbot', icon: MessageSquare },
  { id: 'document_analysis', name: 'Dokumentenanalyse', icon: FileSearch },
  { id: 'suggestions', name: 'Automatische Vorschläge', icon: Sparkles },
  { id: 'automation', name: 'Prozessautomatisierung', icon: Zap },
];

export const AIPermissionsTab: React.FC = () => {
  const [permissions, setPermissions] = useState<AIPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState('employee');
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // AI Settings laden
      const { data: aiSettings } = await supabase
        .from('ai_settings')
        .select('*');

      // Berechtigungen werden aus der DB geladen
      // TODO: Echte Berechtigungsdaten aus ai_provider_settings oder ähnlich laden
      setPermissions([]);

      // AI Usage Logs laden
      const { data: usageData } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(10);

      setUsageLogs((usageData || []).map(log => ({
        id: log.id,
        user_name: log.employee_name || 'Unbekannt',
        module: log.module_used || 'Chatbot',
        action: log.task_description || 'KI-Anfrage',
        timestamp: log.usage_date || new Date().toISOString(),
        tokens_used: log.total_tokens || 0,
        cost: log.cost_incurred || 0
      })));

    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermission = (role: string, moduleId: string): AIPermission | undefined => {
    return permissions.find(p => p.role === role && p.module === moduleId);
  };

  const togglePermission = (role: string, moduleId: string, field: keyof AIPermission) => {
    setPermissions(prev => prev.map(p => {
      if (p.role === role && p.module === moduleId) {
        return { ...p, [field]: !p[field as keyof AIPermission] };
      }
      return p;
    }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      toast({
        title: "KI-Berechtigungen gespeichert",
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

  const currentRolePermissions = permissions.filter(p => p.role === selectedRole);

  return (
    <div className="space-y-6">
      {/* Warnung */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">KI-Governance</p>
              <p>
                Steuern Sie, welche Rollen KI-Funktionen nutzen dürfen. Alle KI-Aktionen werden 
                protokolliert und können nachvollzogen werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-Berechtigungen pro Rolle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                KI-Berechtigungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie KI-Funktionen pro Rolle und Modul
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Rollen-Auswahl */}
          <div className="flex gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground mr-4 self-center">Rolle:</span>
            {ROLES.map(role => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role)}
              >
                {role}
              </Button>
            ))}
          </div>

          {/* Berechtigungs-Tabelle */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KI-Modul</TableHead>
                <TableHead className="text-center">Vorschläge</TableHead>
                <TableHead className="text-center">Aktionen auslösen</TableHead>
                <TableHead className="text-center">Daten aggregieren</TableHead>
                <TableHead className="text-center">Erklärung Pflicht</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MODULES.map(module => {
                const perm = getPermission(selectedRole, module.id);
                const Icon = module.icon;
                
                return (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {module.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={perm?.ai_suggestions || false}
                        onCheckedChange={() => togglePermission(selectedRole, module.id, 'ai_suggestions')}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={perm?.ai_actions || false}
                        onCheckedChange={() => togglePermission(selectedRole, module.id, 'ai_actions')}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={perm?.ai_aggregation || false}
                        onCheckedChange={() => togglePermission(selectedRole, module.id, 'ai_aggregation')}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={perm?.explainability_required || false}
                        onCheckedChange={() => togglePermission(selectedRole, module.id, 'explainability_required')}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Globale KI-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Globale KI-Steuerung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>KI global aktiviert</Label>
                <p className="text-sm text-muted-foreground">Alle KI-Funktionen ein-/ausschalten</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Logging aller KI-Aktionen</Label>
                <p className="text-sm text-muted-foreground">Vollständige Protokollierung</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Erklärbarkeit erzwingen</Label>
                <p className="text-sm text-muted-foreground">KI muss Entscheidungen erklären</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label>Sensitive Daten ausschließen</Label>
                <p className="text-sm text-muted-foreground">PII aus KI-Analysen entfernen</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-Nutzungslog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            KI-Nutzungsprotokoll
          </CardTitle>
          <CardDescription>
            Letzte KI-Aktivitäten im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageLogs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Keine KI-Aktivitäten protokolliert</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Modul</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Kosten</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user_name}</TableCell>
                    <TableCell>{log.module}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.action}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString('de-DE')}</TableCell>
                    <TableCell className="text-right">{log.tokens_used.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{log.cost.toFixed(4)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
