import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedApplicationId?: string;
}

const CreateOfferDialog = ({ open, onOpenChange, preselectedApplicationId }: CreateOfferDialogProps) => {
  const { tenantCompany } = useTenant();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    application_id: preselectedApplicationId || '',
    salary: '',
    currency: 'EUR',
    start_date: '',
    contract_type: 'permanent',
    benefits: ''
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications-for-offer', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          candidate_id,
          job_id,
          candidates (first_name, last_name),
          job_postings (title)
        `)
        .eq('company_id', tenantCompany.id)
        .eq('current_stage', 'decision');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const createOffer = useMutation({
    mutationFn: async () => {
      if (!tenantCompany?.id) throw new Error('Keine Firma ausgewählt');
      
      const selectedApp = applications.find((a: any) => a.id === formData.application_id);
      if (!selectedApp) throw new Error('Bewerbung nicht gefunden');

      const { error } = await supabase.from('job_offers').insert({
        application_id: formData.application_id,
        candidate_id: (selectedApp as any).candidate_id,
        job_id: (selectedApp as any).job_id,
        salary: parseFloat(formData.salary),
        currency: formData.currency,
        start_date: formData.start_date,
        contract_type: formData.contract_type,
        benefits: formData.benefits.split(',').map(s => s.trim()).filter(Boolean),
        status: 'draft',
        company_id: tenantCompany.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Angebot erfolgreich erstellt');
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      onOpenChange(false);
      setFormData({
        application_id: '',
        salary: '',
        currency: 'EUR',
        start_date: '',
        contract_type: 'permanent',
        benefits: ''
      });
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen des Angebots');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Angebot erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Bewerbung *</Label>
            <Select 
              value={formData.application_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, application_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bewerbung auswählen" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app: any) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.candidates?.first_name} {app.candidates?.last_name} - {app.job_postings?.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gehalt *</Label>
              <Input 
                type="number"
                placeholder="65000"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Währung *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Startdatum *</Label>
            <Input 
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Vertragsart *</Label>
            <Select 
              value={formData.contract_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, contract_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Unbefristet</SelectItem>
                <SelectItem value="fixed">Befristet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Benefits (kommagetrennt)</Label>
            <Input 
              placeholder="Home Office, Dienstwagen, Bonus"
              value={formData.benefits}
              onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createOffer.isPending}>
              Angebot erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOfferDialog;
