import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sourceOptions = [
  { value: 'career_portal', label: 'Karriereportal' },
  { value: 'email', label: 'E-Mail' },
  { value: 'api', label: 'API/Jobbörse' },
  { value: 'referral', label: 'Empfehlung' },
  { value: 'manual', label: 'Manuell' },
];

const CreateApplicationDialog = ({ open, onOpenChange }: CreateApplicationDialogProps) => {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    jobId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    source: '',
    gdprConsent: false,
  });

  const { data: jobPostings } = useQuery({
    queryKey: ['job-postings-select', currentCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, location')
        .eq('status', 'published')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompany?.id && open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Create candidate
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          source: formData.source,
          gdpr_consent: formData.gdprConsent,
          company_id: currentCompany?.id,
        })
        .select()
        .single();

      if (candidateError) throw candidateError;

      // 2. Create application
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          candidate_id: candidate.id,
          job_posting_id: formData.jobId,
          current_stage: 'new',
          submitted_at: new Date().toISOString(),
        });

      if (applicationError) throw applicationError;

      return candidate;
    },
    onSuccess: () => {
      toast.success('Bewerbung erfolgreich erfasst');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onOpenChange(false);
      setFormData({
        jobId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        source: '',
        gdprConsent: false,
      });
    },
    onError: (error) => {
      console.error('Error creating application:', error);
      toast.error('Fehler beim Erfassen der Bewerbung');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobId || !formData.firstName || !formData.lastName || !formData.email || !formData.source || !formData.gdprConsent) {
      toast.error('Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Bewerbung erfassen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Stelle *</Label>
            <Select value={formData.jobId} onValueChange={(value) => setFormData({ ...formData, jobId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Stelle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {jobPostings?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} {job.location && `(${job.location})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Vorname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nachname"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-Mail-Adresse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Telefonnummer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Standort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Wohnort"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Quelle *</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Quelle auswählen" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gdprConsent"
              checked={formData.gdprConsent}
              onCheckedChange={(checked) => setFormData({ ...formData, gdprConsent: checked as boolean })}
            />
            <Label htmlFor="gdprConsent" className="text-sm">
              DSGVO-Einwilligung erteilt *
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Wird erstellt...' : 'Bewerbung erfassen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateApplicationDialog;
