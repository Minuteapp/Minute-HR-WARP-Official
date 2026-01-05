import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Trash2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  department_id: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface TeamsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const TeamsStep = ({ onNext, onBack }: TeamsStepProps) => {
  const { tenantCompany } = useTenant();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    department_id: '',
  });

  const companyId = tenantCompany?.id;

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;
    
    const [teamsResult, deptsResult] = await Promise.all([
      supabase
        .from('teams')
        .select('id, name, department_id')
        .eq('company_id', companyId)
        .order('name', { ascending: true }),
      supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', companyId)
        .order('name', { ascending: true }),
    ]);

    if (teamsResult.data) setTeams(teamsResult.data);
    if (deptsResult.data) setDepartments(deptsResult.data);
    setIsLoading(false);
  };

  const handleAddTeam = async () => {
    if (!companyId || !newTeam.name) {
      toast({
        title: 'Name erforderlich',
        description: 'Bitte geben Sie einen Teamnamen an.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase
      .from('teams')
      .insert({
        company_id: companyId,
        name: newTeam.name,
        department_id: newTeam.department_id || null,
        is_active: true,
      });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Team konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Team erstellt',
        description: `${newTeam.name} wurde erfolgreich angelegt.`,
      });
      setNewTeam({ name: '', department_id: '' });
      await loadData();
    }
    
    setIsSaving(false);
  };

  const handleDeleteTeam = async (id: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadData();
    }
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return 'Keine Abteilung';
    return departments.find(d => d.id === deptId)?.name || 'Unbekannt';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Teams einrichten</h2>
        <p className="text-muted-foreground mt-2">
          Erstellen Sie Teams für die Zusammenarbeit.
        </p>
      </div>

      {/* Existing teams */}
      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vorhandene Teams ({teams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDepartmentName(team.department_id)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neues Team hinzufügen</CardTitle>
          <CardDescription>
            Sie können diesen Schritt auch überspringen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="teamName">Teamname *</Label>
            <Input
              id="teamName"
              placeholder="z.B. Entwicklung, Support, Sales"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
          </div>
          
          {departments.length > 0 && (
            <div>
              <Label htmlFor="teamDept">Abteilung (optional)</Label>
              <Select
                value={newTeam.department_id}
                onValueChange={(value) => setNewTeam({ ...newTeam, department_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung wählen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button
            onClick={handleAddTeam}
            disabled={isSaving || !newTeam.name}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Team hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext}>
          {teams.length === 0 ? 'Überspringen' : 'Weiter'}
        </Button>
      </div>
    </div>
  );
};
