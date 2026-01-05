
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateRelocationTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  requests: { id: string; employee_name: string | null }[];
}

export function CreateRelocationTaskDialog({ open, onOpenChange, onSuccess, requests }: CreateRelocationTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    request_id: '',
    category: '',
    task_description: '',
    due_date: '',
    priority: 'medium',
    status: 'offen',
    assigned_to: '',
  });

  const handleSubmit = async () => {
    if (!formData.task_description || !formData.category) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_mobility_relocation_tasks')
        .insert({
          request_id: formData.request_id || null,
          category: formData.category,
          task_description: formData.task_description,
          due_date: formData.due_date || null,
          priority: formData.priority,
          status: formData.status,
          assigned_to: formData.assigned_to || null,
        });

      if (error) throw error;
      
      toast.success('Aufgabe erfolgreich erstellt');
      onSuccess();
      onOpenChange(false);
      setFormData({
        request_id: '',
        category: '',
        task_description: '',
        due_date: '',
        priority: 'medium',
        status: 'offen',
        assigned_to: '',
      });
    } catch (error) {
      console.error('Error creating relocation task:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aufgabe hinzufügen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Entsendung (optional)</Label>
            <Select value={formData.request_id} onValueChange={(v) => setFormData({ ...formData, request_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Entsendung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {requests.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.employee_name || r.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Umzug">Umzug</SelectItem>
                <SelectItem value="Wohnung">Wohnung</SelectItem>
                <SelectItem value="Kinderbetreuung">Kinderbetreuung</SelectItem>
                <SelectItem value="Anmeldung">Anmeldung</SelectItem>
                <SelectItem value="Sprachkurs">Sprachkurs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Aufgabenbeschreibung *</Label>
            <Textarea 
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              placeholder="Beschreiben Sie die Aufgabe..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <Input 
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zuständig</Label>
            <Input 
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Name der zuständigen Person"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Speichere...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
