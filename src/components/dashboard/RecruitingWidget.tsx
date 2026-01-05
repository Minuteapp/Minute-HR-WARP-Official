import { UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useCompany } from '@/contexts/CompanyContext';

const RecruitingWidget = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  // Lade offene Stellenausschreibungen
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['open-job-postings', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return [];

      const { data: jobPostings } = await supabase
        .from('job_postings')
        .select('id, title, status, created_at')
        .eq('company_id', effectiveCompanyId)
        .in('status', ['active', 'open', 'draft'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (!jobPostings || jobPostings.length === 0) return [];

      // Lade Bewerberzahlen für jede Stelle
      const jobIds = jobPostings.map(job => job.id);
      const { data: applications } = await supabase
        .from('job_applications')
        .select('job_posting_id')
        .in('job_posting_id', jobIds);

      // Zähle Bewerbungen pro Stelle
      const applicationCounts = (applications || []).reduce((acc: Record<string, number>, app) => {
        acc[app.job_posting_id] = (acc[app.job_posting_id] || 0) + 1;
        return acc;
      }, {});

      return jobPostings.map(job => ({
        id: job.id,
        position: job.title,
        applications: applicationCounts[job.id] || 0,
        status: job.status === 'active' ? 'Aktiv' : job.status === 'draft' ? 'Entwurf' : 'Offen'
      }));
    }
  });

  // Berechne Gesamtzahl der Bewerbungen
  const totalApplications = jobs.reduce((sum, job) => sum + job.applications, 0);

  const handleWidgetClick = () => {
    navigate('/recruiting');
  };

  const handleJobClick = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/recruiting/jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Recruiting</h2>
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200 text-xs">
          {jobs.length} Stellen
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold mb-0.5">{jobs.length}</div>
          <div className="text-xs text-gray-600">Offene Stellen</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold mb-0.5">{totalApplications}</div>
          <div className="text-xs text-gray-600">Bewerbungen</div>
        </div>
      </div>
      
      {jobs.length > 0 ? (
        <div className="space-y-2 mb-3">
          {jobs.slice(0, 3).map((job) => (
            <div 
              key={job.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={(e) => handleJobClick(job.id, e)}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{job.position}</p>
                <p className="text-xs text-gray-500">{job.applications} Bewerbungen</p>
              </div>
              <Badge 
                className={`text-[10px] px-2 py-0.5 ${
                  job.status === 'Aktiv'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
                    : job.status === 'Entwurf'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200'
                }`}
              >
                {job.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 text-center mb-3">
          <UserPlus className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Keine offenen Stellen</p>
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 h-9 text-sm"
        onClick={handleWidgetClick}
      >
        {jobs.length > 0 ? 'Alle Stellen anzeigen' : 'Neue Stelle erstellen'}
      </Button>
    </Card>
  );
};

export default RecruitingWidget;