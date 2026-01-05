
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateEmployeeDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  requests: { id: string; employee_name: string | null }[];
}

export function CreateEmployeeDataDialog({ open, onOpenChange, onSuccess, requests }: CreateEmployeeDataDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    request_id: '',
    contract_status: '',
    employment_model: '',
    work_time_model: '',
    family_members_count: 0,
  });

  const handleSubmit = async () => {
    if (!formData.request_id) {
      toast.error('Bitte wählen Sie eine Entsendung aus');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_mobility_employee_family')
        .insert({
          request_id: formData.request_id,
          contract_status: formData.contract_status || null,
          employment_model: formData.employment_model || null,
          work_time_model: formData.work_time_model || null,
          family_members_count: formData.family_members_count,
        });

      if (error) throw error;
      
      toast.success('Mitarbeiterdaten erfolgreich erfasst');
      onSuccess();
      onOpenChange(false);
      setFormData({
        request_id: '',
        contract_status: '',
        employment_model: '',
        work_time_model: '',
        family_members_count: 0,
      });
    } catch (error) {
      console.error('Error creating employee data:', error);
      toast.error('Fehler beim Erfassen der Mitarbeiterdaten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mitarbeiterdaten erfassen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Entsendung</Label>
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
            <Label>Vertragsstatus</Label>
            <Select value={formData.contract_status} onValueChange={(v) => setFormData({ ...formData, contract_status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktiv - Entsendungsvertrag">Aktiv - Entsendungsvertrag</SelectItem>
                <SelectItem value="Aktiv - Lokaler Vertrag">Aktiv - Lokaler Vertrag</SelectItem>
                <SelectItem value="In Vorbereitung">In Vorbereitung</SelectItem>
                <SelectItem value="Beendet">Beendet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Beschäftigungsmodell</Label>
            <Select value={formData.employment_model} onValueChange={(v) => setFormData({ ...formData, employment_model: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Modell auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entsendung">Entsendung</SelectItem>
                <SelectItem value="Lokaler Vertrag">Lokaler Vertrag</SelectItem>
                <SelectItem value="Expat">Expat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Arbeitszeitmodell</Label>
            <Select value={formData.work_time_model} onValueChange={(v) => setFormData({ ...formData, work_time_model: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Arbeitszeitmodell auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vollzeit (40h/Woche)">Vollzeit (40h/Woche)</SelectItem>
                <SelectItem value="Teilzeit (30h/Woche)">Teilzeit (30h/Woche)</SelectItem>
                <SelectItem value="Teilzeit (20h/Woche)">Teilzeit (20h/Woche)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Anzahl Familienmitglieder</Label>
            <Input 
              type="number" 
              min={0} 
              value={formData.family_members_count}
              onChange={(e) => setFormData({ ...formData, family_members_count: parseInt(e.target.value) || 0 })}
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
