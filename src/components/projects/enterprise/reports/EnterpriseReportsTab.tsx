import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReportsHeader from './ReportsHeader';
import ReportsStatsCards from './ReportsStatsCards';
import ReportTemplates from './ReportTemplates';
import DataExportSection from './DataExportSection';
import RecentReportsSection from './RecentReportsSection';

const EnterpriseReportsTab = () => {
  // Fetch project statistics
  const { data: projectStats } = useQuery({
    queryKey: ['project-report-stats'],
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, status, progress');

      if (error) throw error;

      const active = projects?.filter(p => p.status === 'active' || p.status === 'in_progress').length || 0;
      const onTrack = projects?.filter(p => p.status === 'on_track' || (p.progress && p.progress >= 50)).length || 0;
      const atRisk = projects?.filter(p => p.status === 'at_risk' || p.status === 'delayed').length || 0;
      const avgProgress = projects?.length 
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
        : 0;

      return { active, onTrack, atRisk, avgProgress };
    },
  });

  // Fetch recent reports from reports table
  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id, title, type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(report => ({
        id: report.id,
        fileName: report.title,
        generatedAt: report.created_at,
        type: report.type === 'monthly' ? 'Portfolio' : 
              report.type === 'expense' ? 'Budget' :
              report.type === 'project' ? 'Ressourcen' : 'Risiko',
        format: 'PDF',
      }));
    },
  });

  return (
    <div className="space-y-6">
      <ReportsHeader />
      
      <ReportsStatsCards
        activeProjects={projectStats?.active || 0}
        onTrack={projectStats?.onTrack || 0}
        atRisk={projectStats?.atRisk || 0}
        avgProgress={projectStats?.avgProgress || 0}
      />

      <ReportTemplates />

      <DataExportSection />

      <RecentReportsSection reports={recentReports || []} />
    </div>
  );
};

export default EnterpriseReportsTab;
