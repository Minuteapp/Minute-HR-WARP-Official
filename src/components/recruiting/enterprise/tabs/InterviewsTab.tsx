import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import InterviewsHeader from '../interviews/InterviewsHeader';
import InterviewCard from '../interviews/InterviewCard';
import PlanInterviewDialog from '../interviews/PlanInterviewDialog';
import SubmitFeedbackDialog from '../interviews/SubmitFeedbackDialog';
import { Calendar } from 'lucide-react';

const InterviewsTab = () => {
  const { tenantCompany } = useTenant();
  const queryClient = useQueryClient();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id, interview_date, duration_minutes, round, interviewers, interview_type, status,
          job_applications (
            candidates (first_name, last_name),
            job_postings (title)
          )
        `)
        .eq('company_id', tenantCompany.id)
        .eq('status', 'scheduled')
        .order('interview_date', { ascending: true });
      if (error) throw error;
      return (data || []).map((i: any) => ({
        ...i,
        candidate_name: `${i.job_applications?.candidates?.first_name || ''} ${i.job_applications?.candidates?.last_name || ''}`.trim(),
        job_title: i.job_applications?.job_postings?.title || '',
        interviewers: i.interviewers || []
      }));
    },
    enabled: !!tenantCompany?.id
  });

  const completeInterview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('interviews').update({ status: 'completed' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Interview abgeschlossen');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });

  return (
    <div>
      <InterviewsHeader onPlanInterview={() => setPlanDialogOpen(true)} onSubmitFeedback={() => setFeedbackDialogOpen(true)} />
      
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Lade Interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Keine Interviews geplant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview: any) => (
            <InterviewCard key={interview.id} interview={interview} onComplete={(id) => completeInterview.mutate(id)} onClick={() => {}} />
          ))}
        </div>
      )}

      <PlanInterviewDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} />
      <SubmitFeedbackDialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen} />
    </div>
  );
};

export default InterviewsTab;
