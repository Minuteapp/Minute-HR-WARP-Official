import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateJobDialog = ({ open, onOpenChange }: CreateJobDialogProps) => {
  const queryClient = useQueryClient();
  const { currentCompany } = useCompany();
  
  const [formData, setFormData] = useState({
    title: '',
    organization_unit: '',
    department: '',
    location: '',
    country: '',
    contract_type: '',
    headcount_type: '',
    budget_reference: '',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    currency: 'EUR',
    reporting_line: '',
    cost_center: '',
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('job_postings').insert({
        title: formData.title,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        currency: formData.currency,
        contract_type: formData.contract_type,
        employment_type: formData.headcount_type,
        status: 'draft',
        company_id: currentCompany?.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Stelle erfolgreich erstellt');
      onOpenChange(false);
      setFormData({
        title: '',
        organization_unit: '',
        department: '',
        location: '',
        country: '',
        contract_type: '',
        headcount_type: '',
        budget_reference: '',
        description: '',
        requirements: '',
        salary_min: '',
        salary_max: '',
        currency: 'EUR',
        reporting_line: '',
        cost_center: '',
      });
    },
    onError: () => {
      toast.error('Fehler beim Erstellen der Stelle');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.location) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    createJobMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Stelle erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stellentitel *</Label>
              <Input
                id="title"
                placeholder="z.B. Senior Software Engineer"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization_unit">Organisationseinheit *</Label>
              <Input
                id="organization_unit"
                placeholder="z.B. Technology Division"
                value={formData.organization_unit}
                onChange={(e) => updateField('organization_unit', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Abteilung *</Label>
              <Input
                id="department"
                placeholder="z.B. Engineering"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Standort *</Label>
              <Input
                id="location"
                placeholder="z.B. Berlin"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Land *</Label>
              <Input
                id="country"
                placeholder="z.B. Deutschland"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_type">Vertragsart *</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => updateField('contract_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unbefristet">Unbefristet</SelectItem>
                  <SelectItem value="befristet">Befristet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="headcount_type">Headcount-Typ *</Label>
              <Select
                value={formData.headcount_type}
                onValueChange={(value) => updateField('headcount_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="ersatz">Ersatz</SelectItem>
                  <SelectItem value="neubesetzung">Neubesetzung</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budget_reference">Budgetreferenz</Label>
              <Input
                id="budget_reference"
                placeholder="Optional"
                value={formData.budget_reference}
                onChange={(e) => updateField('budget_reference', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Aufgaben & Anforderungen *</Label>
            <Textarea
              id="description"
              placeholder="Beschreiben Sie die Aufgaben und Anforderungen..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requirements">Anforderungen *</Label>
            <Textarea
              id="requirements"
              placeholder="Beschreiben Sie die Anforderungen..."
              value={formData.requirements}
              onChange={(e) => updateField('requirements', e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min">Gehaltsband Min *</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="z.B. 50000"
                value={formData.salary_min}
                onChange={(e) => updateField('salary_min', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary_max">Gehaltsband Max *</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="z.B. 70000"
                value={formData.salary_max}
                onChange={(e) => updateField('salary_max', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Währung *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => updateField('currency', value)}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporting_line">Reporting-Linie</Label>
              <Input
                id="reporting_line"
                placeholder="Optional"
                value={formData.reporting_line}
                onChange={(e) => updateField('reporting_line', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost_center">Kostenstelle</Label>
              <Input
                id="cost_center"
                placeholder="Optional"
                value={formData.cost_center}
                onChange={(e) => updateField('cost_center', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? 'Wird erstellt...' : 'Stelle erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
