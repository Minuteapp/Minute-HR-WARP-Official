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

interface PlanInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PlanInterviewDialog = ({ open, onOpenChange }: PlanInterviewDialogProps) => {
  const { tenantCompany } = useTenant();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    application_id: '',
    round: 1,
    interview_type: 'video',
    interview_date: '',
    duration_minutes: 60,
    interviewers: ''
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['job-applications-for-interview', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          candidates (first_name, last_name),
          job_postings (title)
        `)
        .eq('company_id', tenantCompany.id)
        .in('current_stage', ['interview', 'assessment']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const createInterview = useMutation({
    mutationFn: async () => {
      if (!tenantCompany?.id) throw new Error('Keine Firma ausgewählt');
      
      const selectedApp = applications.find((a: any) => a.id === formData.application_id);
      if (!selectedApp) throw new Error('Bewerbung nicht gefunden');

      const { error } = await supabase.from('interviews').insert({
        application_id: formData.application_id,
        candidate_id: (selectedApp as any).candidates?.id,
        interview_date: formData.interview_date,
        interview_type: formData.interview_type,
        duration_minutes: formData.duration_minutes,
        round: formData.round,
        interviewers: formData.interviewers.split(',').map(s => s.trim()).filter(Boolean),
        status: 'scheduled',
        company_id: tenantCompany.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Interview erfolgreich geplant');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      onOpenChange(false);
      setFormData({
        application_id: '',
        round: 1,
        interview_type: 'video',
        interview_date: '',
        duration_minutes: 60,
        interviewers: ''
      });
    },
    onError: (error) => {
      toast.error('Fehler beim Planen des Interviews');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInterview.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Interview planen</DialogTitle>
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
              <Label>Interview-Runde *</Label>
              <Input 
                type="number" 
                min="1" 
                max="5"
                value={formData.round}
                onChange={(e) => setFormData(prev => ({ ...prev, round: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Typ *</Label>
              <Select 
                value={formData.interview_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, interview_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="onsite">Vor Ort</SelectItem>
                  <SelectItem value="phone">Telefon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Datum & Zeit *</Label>
            <Input 
              type="datetime-local"
              value={formData.interview_date}
              onChange={(e) => setFormData(prev => ({ ...prev, interview_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Dauer (Minuten) *</Label>
            <Input 
              type="number"
              min="15"
              max="180"
              value={formData.duration_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Interviewer (kommagetrennt) *</Label>
            <Input 
              placeholder="Max Mustermann, Anna Schmidt"
              value={formData.interviewers}
              onChange={(e) => setFormData(prev => ({ ...prev, interviewers: e.target.value }))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createInterview.isPending}>
              Interview planen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlanInterviewDialog;
