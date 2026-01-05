import { Button } from '@/components/ui/button';
import { Pause, Play, Send, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JobActionButtonsProps {
  jobId: string;
  status: string;
}

const JobActionButtons = ({ jobId, status }: JobActionButtonsProps) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from('job_postings')
        .update({ status: newStatus })
        .eq('id', jobId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Status erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Status');
    },
  });

  const handleAction = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  const getActionButton = () => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'published':
      case 'veröffentlicht':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('paused')}
            disabled={updateStatusMutation.isPending}
          >
            <Pause className="h-4 w-4 mr-1" />
            Pausieren
          </Button>
        );
      
      case 'approved':
      case 'freigegeben':
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction('active')}
            disabled={updateStatusMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Veröffentlichen
          </Button>
        );
      
      case 'draft':
      case 'entwurf':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('pending_approval')}
            disabled={updateStatusMutation.isPending}
          >
            <Send className="h-4 w-4 mr-1" />
            Zur Genehmigung
          </Button>
        );
      
      case 'pending_approval':
      case 'in_genehmigung':
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction('approved')}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Genehmigen
          </Button>
        );
      
      case 'paused':
      case 'pausiert':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('active')}
            disabled={updateStatusMutation.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Reaktivieren
          </Button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getActionButton()}
    </div>
  );
};

export default JobActionButtons;
