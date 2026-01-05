
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface BasicInfoTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const BasicInfoTab = ({ 
  formData, 
  onChange, 
  onNext, 
  active, 
  forceMount = false,
  mode 
}: BasicInfoTabProps) => {
  // Mitarbeiter für Projektleiter-Auswahl laden
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees-for-project-lead'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, position')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <TabsContent value="basic-info" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Projektname *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Name des Projekts eingeben"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Projektbeschreibung eingeben"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsiblePerson">Projektleiter</Label>
          <Select 
            value={formData.responsiblePerson || ''} 
            onValueChange={(value) => onChange('responsiblePerson', value)}
          >
            <SelectTrigger>
              {loadingEmployees ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Laden...</span>
                </div>
              ) : (
                <SelectValue placeholder="Projektleiter wählen" />
              )}
            </SelectTrigger>
            <SelectContent>
              {employees?.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                  {employee.position && ` - ${employee.position}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priorität</Label>
            <Select value={formData.priority} onValueChange={(value) => onChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Priorität wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => onChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Geplant</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext}>
            Weiter
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
