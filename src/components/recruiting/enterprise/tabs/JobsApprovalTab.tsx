import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import JobCard from '../jobs/JobCard';
import CreateJobDialog from '../jobs/CreateJobDialog';
import { Skeleton } from '@/components/ui/skeleton';

const JobsApprovalTab = () => {
  const { currentCompany } = useCompany();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['job-postings', currentCompany?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompany?.id,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Stellen & Genehmigungen</h2>
          <p className="text-sm text-muted-foreground">
            Verwaltung von Stellenanzeigen und Genehmigungsworkflows
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Stelle erstellen
        </Button>
      </div>

      <div className="mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="pending_approval">In Genehmigung</SelectItem>
            <SelectItem value="approved">Freigegeben</SelectItem>
            <SelectItem value="active">Veröffentlicht</SelectItem>
            <SelectItem value="paused">Pausiert</SelectItem>
            <SelectItem value="closed">Geschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Stellen gefunden.</p>
            <p className="text-sm mt-1">
              Erstellen Sie eine neue Stelle, um loszulegen.
            </p>
          </div>
        )}
      </div>

      <CreateJobDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default JobsApprovalTab;
