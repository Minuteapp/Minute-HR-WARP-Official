import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Trash2, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubstituteRule {
  id: string;
  user_id: string;
  substitute_user_id: string;
  absence_types: string[] | null;
  auto_assign: boolean;
  notification_enabled: boolean;
  priority: number;
  valid_from: string | null;
  valid_until: string | null;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

export const AbsenceSubstituteRules = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rules, setRules] = useState<SubstituteRule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    substitute_user_id: '',
    absence_types: [] as string[],
    auto_assign: false,
    notification_enabled: true,
    priority: 1
  });

  useEffect(() => {
    loadSubstituteRules();
    loadEmployees();
  }, [user?.id]);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, department')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
    }
  };

  const loadSubstituteRules = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('absence_substitute_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority');

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Vertretungsregeln:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vertretungsregeln konnten nicht geladen werden."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!user?.id || !newRule.substitute_user_id) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte wählen Sie einen Vertreter aus."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('absence_substitute_rules')
        .insert({
          user_id: user.id,
          substitute_user_id: newRule.substitute_user_id,
          absence_types: newRule.absence_types.length > 0 ? newRule.absence_types : null,
          auto_assign: newRule.auto_assign,
          notification_enabled: newRule.notification_enabled,
          priority: newRule.priority
        });

      if (error) throw error;

      toast({
        title: "Vertretungsregel hinzugefügt",
        description: "Die Vertretungsregel wurde erfolgreich erstellt."
      });

      setNewRule({
        substitute_user_id: '',
        absence_types: [],
        auto_assign: false,
        notification_enabled: true,
        priority: 1
      });

      loadSubstituteRules();
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vertretungsregel konnte nicht erstellt werden."
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('absence_substitute_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Vertretungsregel gelöscht",
        description: "Die Vertretungsregel wurde erfolgreich entfernt."
      });

      loadSubstituteRules();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Vertretungsregel konnte nicht gelöscht werden."
      });
    }
  };

  const handleToggleAutoAssign = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('absence_substitute_rules')
        .update({ auto_assign: !currentValue })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Auto-Zuweisung geändert",
        description: `Auto-Zuweisung wurde ${!currentValue ? 'aktiviert' : 'deaktiviert'}.`
      });

      loadSubstituteRules();
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einstellung konnte nicht geändert werden."
      });
    }
  };

  const getEmployeeName = (userId: string) => {
    const employee = employees.find(e => e.id === userId);
    return employee ? employee.name : 'Unbekannt';
  };

  const getAbsenceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      training: 'Weiterbildung',
      special: 'Sonderurlaub'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Neue Vertretungsregel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neue Vertretungsregel erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="substitute">Vertreter *</Label>
            <Select
              value={newRule.substitute_user_id}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, substitute_user_id: value }))}
            >
              <SelectTrigger id="substitute">
                <SelectValue placeholder="Vertreter auswählen" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorität</Label>
            <Select
              value={newRule.priority.toString()}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, priority: parseInt(value) }))}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (Höchste)</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 (Niedrigste)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Bei mehreren Vertretern wird die höchste Priorität bevorzugt
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-assign" className="text-base">
                  Automatische Zuweisung
                </Label>
                <p className="text-sm text-muted-foreground">
                  Vertreter wird automatisch bei Abwesenheit zugewiesen
                </p>
              </div>
              <Switch
                id="auto-assign"
                checked={newRule.auto_assign}
                onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, auto_assign: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification" className="text-base">
                  Benachrichtigung aktiviert
                </Label>
                <p className="text-sm text-muted-foreground">
                  Vertreter erhält Benachrichtigung bei Zuweisung
                </p>
              </div>
              <Switch
                id="notification"
                checked={newRule.notification_enabled}
                onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, notification_enabled: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleAddRule} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Vertretungsregel erstellen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste der Vertretungsregeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Meine Vertretungsregeln
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Lädt Vertretungsregeln...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Vertretungsregeln vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {getEmployeeName(rule.substitute_user_id)}
                      </span>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        Priorität {rule.priority}
                      </span>
                    </div>

                    {rule.absence_types && rule.absence_types.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {rule.absence_types.map(type => (
                          <span key={type} className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                            {getAbsenceTypeLabel(type)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Auto-Zuweisung: {rule.auto_assign ? '✓ Ja' : '✗ Nein'}</span>
                      <span>Benachrichtigung: {rule.notification_enabled ? '✓ Ja' : '✗ Nein'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.auto_assign}
                      onCheckedChange={() => handleToggleAutoAssign(rule.id, rule.auto_assign)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info-Box */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <UserCheck className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Hinweis zu Vertretungsregeln</p>
              <p>
                Definieren Sie hier Ihre Vertreter für verschiedene Abwesenheitstypen. 
                Bei automatischer Zuweisung wird der Vertreter mit der höchsten Priorität automatisch benachrichtigt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
