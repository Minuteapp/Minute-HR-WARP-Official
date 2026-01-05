
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  requests: { id: string; employee_name: string | null }[];
}

export function CreateComplianceDialog({ open, onOpenChange, onSuccess, requests }: CreateComplianceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    request_id: '',
    compliance_type: '',
    requirement: '',
    status: 'pending',
    due_date: '',
    responsible_party: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.requirement || !formData.compliance_type) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_mobility_compliance')
        .insert({
          request_id: formData.request_id || null,
          compliance_type: formData.compliance_type,
          requirement: formData.requirement,
          status: formData.status,
          due_date: formData.due_date || null,
          responsible_party: formData.responsible_party || null,
          notes: formData.notes || null,
        });

      if (error) throw error;
      
      toast.success('Compliance-Eintrag erfolgreich erstellt');
      onSuccess();
      onOpenChange(false);
      setFormData({
        request_id: '',
        compliance_type: '',
        requirement: '',
        status: 'pending',
        due_date: '',
        responsible_party: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating compliance entry:', error);
      toast.error('Fehler beim Erstellen des Compliance-Eintrags');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compliance-Eintrag anlegen</DialogTitle>
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
            <Select value={formData.compliance_type} onValueChange={(v) => setFormData({ ...formData, compliance_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visum">Visum</SelectItem>
                <SelectItem value="Arbeitserlaubnis">Arbeitserlaubnis</SelectItem>
                <SelectItem value="Steuern">Steuern</SelectItem>
                <SelectItem value="Sozialversicherung">Sozialversicherung</SelectItem>
                <SelectItem value="Aufenthaltstitel">Aufenthaltstitel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Anforderung *</Label>
            <Input 
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              placeholder="z.B. L-1 Visum beantragen"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fälligkeitsdatum</Label>
            <Input 
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Verantwortlich</Label>
            <Input 
              value={formData.responsible_party}
              onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
              placeholder="Name der verantwortlichen Person"
            />
          </div>

          <div className="space-y-2">
            <Label>Notizen</Label>
            <Textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Zusätzliche Informationen..."
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
