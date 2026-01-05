import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Skeleton } from '@/components/ui/skeleton';
import ApplicationsHeader from '../applications/ApplicationsHeader';
import ApplicationsKanbanView from '../applications/ApplicationsKanbanView';
import ApplicationsTableView from '../applications/ApplicationsTableView';
import CreateApplicationDialog from '../applications/CreateApplicationDialog';
import ApplicationDetailsDialog from '../applications/ApplicationDetailsDialog';

interface Application {
  id: string;
  current_stage: string;
  submitted_at: string;
  notes?: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    location?: string;
    source?: string;
    gdpr_consent?: boolean;
  };
  job_posting: {
    id: string;
    title: string;
    location?: string;
    department?: string;
    employment_type?: string;
  };
}

const ApplicationsTab = () => {
  const { currentCompany } = useCompany();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', currentCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          current_stage,
          submitted_at,
          notes,
          candidate:candidates(
            id,
            first_name,
            last_name,
            email,
            phone,
            location,
            source,
            gdpr_consent
          ),
          job_posting:job_postings(
            id,
            title,
            location,
            department,
            employment_type
          )
        `)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(app => ({
        ...app,
        candidate: Array.isArray(app.candidate) ? app.candidate[0] : app.candidate,
        job_posting: Array.isArray(app.job_posting) ? app.job_posting[0] : app.job_posting,
      })) as Application[];
    },
    enabled: !!currentCompany?.id,
  });

  const handleCardClick = (application: Application) => {
    setSelectedApplication(application);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ApplicationsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateClick={() => setCreateDialogOpen(true)}
      />

      {viewMode === 'kanban' ? (
        <ApplicationsKanbanView
          applications={applications || []}
          onCardClick={handleCardClick}
        />
      ) : (
        <ApplicationsTableView
          applications={applications || []}
          onDetailsClick={handleCardClick}
        />
      )}

      <CreateApplicationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <ApplicationDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        application={selectedApplication}
      />
    </div>
  );
};

export default ApplicationsTab;
