import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import DecisionsHeader from '../decisions/DecisionsHeader';
import PendingDecisionCard from '../decisions/PendingDecisionCard';
import OfferCard from '../decisions/OfferCard';
import DecisionKPICards from '../decisions/DecisionKPICards';
import CreateOfferDialog from '../decisions/CreateOfferDialog';

const DecisionsTab = () => {
  const { tenantCompany } = useTenant();
  const queryClient = useQueryClient();
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  const { data: pendingDecisions = [] } = useQuery({
    queryKey: ['pending-decisions', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('job_applications')
        .select(`id, submitted_at, candidates (first_name, last_name, email), job_postings (title)`)
        .eq('company_id', tenantCompany.id)
        .eq('current_stage', 'decision');
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id, application_id: a.id,
        candidate_name: `${a.candidates?.first_name || ''} ${a.candidates?.last_name || ''}`.trim(),
        candidate_email: a.candidates?.email || '',
        job_title: a.job_postings?.title || '',
        applied_at: a.submitted_at
      }));
    },
    enabled: !!tenantCompany?.id
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['job-offers', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('job_offers')
        .select(`*, candidates (first_name, last_name), job_postings (title)`)
        .eq('company_id', tenantCompany.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((o: any) => ({
        ...o, candidate_name: `${o.candidates?.first_name || ''} ${o.candidates?.last_name || ''}`.trim(),
        job_title: o.job_postings?.title || ''
      }));
    },
    enabled: !!tenantCompany?.id
  });

  const updateOfferStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('job_offers').update({ status, responded_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Angebotsstatus aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
    }
  });

  const rejectApplication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_applications').update({ current_stage: 'rejected' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Bewerbung abgelehnt');
      queryClient.invalidateQueries({ queryKey: ['pending-decisions'] });
    }
  });

  return (
    <div>
      <DecisionsHeader onCreateOffer={() => setCreateOfferOpen(true)} />
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Ausstehende Entscheidungen</h3>
          {pendingDecisions.length === 0 ? (
            <p className="text-muted-foreground text-sm">Keine ausstehenden Entscheidungen.</p>
          ) : (
            <div className="space-y-3">
              {pendingDecisions.map((d: any) => (
                <PendingDecisionCard key={d.id} decision={d} onCreateOffer={() => setCreateOfferOpen(true)} onAddToTalentPool={() => {}} onReject={(id) => rejectApplication.mutate(id)} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-3">Angebote</h3>
          {offers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Keine Angebote vorhanden.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {offers.map((o: any) => (
                <OfferCard key={o.id} offer={o} onAccept={(id) => updateOfferStatus.mutate({ id, status: 'accepted' })} onReject={(id) => updateOfferStatus.mutate({ id, status: 'rejected' })} />
              ))}
            </div>
          )}
        </div>
      </div>

      <DecisionKPICards pendingCount={pendingDecisions.length} sentCount={offers.filter((o: any) => o.status === 'sent').length} hiredCount={offers.filter((o: any) => o.status === 'accepted').length} />
      <CreateOfferDialog open={createOfferOpen} onOpenChange={setCreateOfferOpen} />
    </div>
  );
};

export default DecisionsTab;
