import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTenant } from '@/contexts/TenantContext';
import { Star } from 'lucide-react';

interface SubmitFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RatingInput = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-sm">{label}</Label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  </div>
);

const SubmitFeedbackDialog = ({ open, onOpenChange }: SubmitFeedbackDialogProps) => {
  const { tenantCompany } = useTenant();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    interview_id: '',
    reviewer_name: '',
    reviewer_role: '',
    recommendation: 'neutral',
    technical_skills: 3,
    communication: 3,
    culture_fit: 3,
    experience: 3,
    comment: ''
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews-for-feedback', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id,
          interview_date,
          round,
          job_applications (
            candidates (first_name, last_name),
            job_postings (title)
          )
        `)
        .eq('company_id', tenantCompany.id)
        .eq('status', 'scheduled')
        .order('interview_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const submitFeedback = useMutation({
    mutationFn: async () => {
      if (!tenantCompany?.id) throw new Error('Keine Firma ausgewählt');
      
      const { error } = await supabase.from('interview_feedback').insert({
        interview_id: formData.interview_id,
        reviewer_name: formData.reviewer_name,
        reviewer_role: formData.reviewer_role,
        recommendation: formData.recommendation,
        technical_skills: formData.technical_skills,
        communication: formData.communication,
        culture_fit: formData.culture_fit,
        experience: formData.experience,
        comment: formData.comment,
        company_id: tenantCompany.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bewertung erfolgreich abgegeben');
      queryClient.invalidateQueries({ queryKey: ['interview-feedback'] });
      onOpenChange(false);
      setFormData({
        interview_id: '',
        reviewer_name: '',
        reviewer_role: '',
        recommendation: 'neutral',
        technical_skills: 3,
        communication: 3,
        culture_fit: 3,
        experience: 3,
        comment: ''
      });
    },
    onError: (error) => {
      toast.error('Fehler beim Abgeben der Bewertung');
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bewertung abgeben</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Interview *</Label>
            <Select 
              value={formData.interview_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, interview_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Interview auswählen" />
              </SelectTrigger>
              <SelectContent>
                {interviews.map((interview: any) => (
                  <SelectItem key={interview.id} value={interview.id}>
                    {interview.job_applications?.candidates?.first_name} {interview.job_applications?.candidates?.last_name} - Runde {interview.round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ihr Name *</Label>
              <Input 
                value={formData.reviewer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewer_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ihre Rolle</Label>
              <Input 
                placeholder="z.B. Tech Lead"
                value={formData.reviewer_role}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewer_role: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Empfehlung *</Label>
            <Select 
              value={formData.recommendation} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, recommendation: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Empfohlen</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="not_recommended">Nicht empfohlen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <RatingInput 
              label="Technische Fähigkeiten"
              value={formData.technical_skills}
              onChange={(v) => setFormData(prev => ({ ...prev, technical_skills: v }))}
            />
            <RatingInput 
              label="Kommunikation"
              value={formData.communication}
              onChange={(v) => setFormData(prev => ({ ...prev, communication: v }))}
            />
            <RatingInput 
              label="Culture Fit"
              value={formData.culture_fit}
              onChange={(v) => setFormData(prev => ({ ...prev, culture_fit: v }))}
            />
            <RatingInput 
              label="Erfahrung"
              value={formData.experience}
              onChange={(v) => setFormData(prev => ({ ...prev, experience: v }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Kommentar</Label>
            <Textarea 
              placeholder="Ihre Einschätzung..."
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitFeedback.isPending}>
              Bewertung abgeben
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitFeedbackDialog;
