import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Network, Plus, Trash2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface DepartmentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const DepartmentsStep = ({ onNext, onBack }: DepartmentsStepProps) => {
  const { tenantCompany } = useTenant();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
  });

  const companyId = tenantCompany?.id;

  useEffect(() => {
    if (companyId) {
      loadDepartments();
    }
  }, [companyId]);

  const loadDepartments = async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, description')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (!error && data) {
      setDepartments(data);
    }
    setIsLoading(false);
  };

  const handleAddDepartment = async () => {
    if (!companyId || !newDepartment.name) {
      toast({
        title: 'Name erforderlich',
        description: 'Bitte geben Sie einen Abteilungsnamen an.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase
      .from('departments')
      .insert({
        company_id: companyId,
        name: newDepartment.name,
        description: newDepartment.description || null,
        is_active: true,
      });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Abteilung konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Abteilung erstellt',
        description: `${newDepartment.name} wurde erfolgreich angelegt.`,
      });
      setNewDepartment({ name: '', description: '' });
      await loadDepartments();
    }
    
    setIsSaving(false);
  };

  const handleDeleteDepartment = async (id: string) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadDepartments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Network className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Abteilungen erstellen</h2>
        <p className="text-muted-foreground mt-2">
          Definieren Sie die Organisationsstruktur Ihrer Firma.
        </p>
      </div>

      {/* Existing departments */}
      {departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vorhandene Abteilungen ({departments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{department.name}</p>
                    {department.description && (
                      <p className="text-sm text-muted-foreground">{department.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new department */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neue Abteilung hinzufügen</CardTitle>
          <CardDescription>
            Sie können diesen Schritt auch überspringen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="deptName">Abteilungsname *</Label>
            <Input
              id="deptName"
              placeholder="z.B. Personal, IT, Vertrieb"
              value={newDepartment.name}
              onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="deptDescription">Beschreibung</Label>
            <Textarea
              id="deptDescription"
              placeholder="Kurze Beschreibung der Abteilung"
              value={newDepartment.description}
              onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
            />
          </div>
          
          <Button
            onClick={handleAddDepartment}
            disabled={isSaving || !newDepartment.name}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Abteilung hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext}>
          {departments.length === 0 ? 'Überspringen' : 'Weiter'}
        </Button>
      </div>
    </div>
  );
};
