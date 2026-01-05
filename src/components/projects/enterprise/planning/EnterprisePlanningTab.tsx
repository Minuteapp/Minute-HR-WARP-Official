import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PlanningStatsCards from './PlanningStatsCards';
import PlanningViewTabs from './PlanningViewTabs';
import GanttView from './views/GanttView';
import TimelineView from './views/TimelineView';
import MilestoneListView from './views/MilestoneListView';

type ViewType = 'timeline' | 'milestone-list' | 'gantt';

const EnterprisePlanningTab = () => {
  const [activeView, setActiveView] = useState<ViewType>('gantt');
  const [stats, setStats] = useState({
    totalMilestones: 0,
    upcomingMilestones: 0,
    inProgressMilestones: 0,
    completedMilestones: 0
  });
  const [ganttProjects, setGanttProjects] = useState<any[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [projectTimelines, setProjectTimelines] = useState<any[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load projects with milestones
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const { data: milestones, error: milestonesError } = await supabase
        .from('project_milestones')
        .select('*')
        .order('due_date', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Calculate stats
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const completed = milestones?.filter(m => m.status === 'completed') || [];
      const inProgress = milestones?.filter(m => m.status === 'in_progress') || [];
      const upcoming = milestones?.filter(m => {
        const dueDate = new Date(m.due_date);
        return dueDate >= now && dueDate <= thirtyDaysFromNow && m.status !== 'completed';
      }) || [];

      setStats({
        totalMilestones: milestones?.length || 0,
        upcomingMilestones: upcoming.length,
        inProgressMilestones: inProgress.length,
        completedMilestones: completed.length
      });

      // Prepare Gantt data
      const ganttData = (projects || []).map(project => {
        const projectMilestonesList = (milestones || []).filter(m => m.project_id === project.id);
        return {
          id: project.id,
          name: project.name,
          owner: project.project_owner || 'Nicht zugewiesen',
          startDate: new Date(project.start_date || project.created_at),
          endDate: new Date(project.end_date || new Date(new Date().setMonth(new Date().getMonth() + 3))),
          progress: project.progress || 0,
          status: mapProjectStatus(project.status),
          milestones: projectMilestonesList.map(m => ({ date: new Date(m.due_date) }))
        };
      });
      setGanttProjects(ganttData);

      // Prepare upcoming milestones
      const upcomingData = upcoming.map(m => {
        const project = projects?.find(p => p.id === m.project_id);
        return {
          id: m.id,
          title: m.name,
          projectName: project?.name || 'Unbekanntes Projekt',
          dueDate: new Date(m.due_date)
        };
      });
      setUpcomingMilestones(upcomingData);

      // Prepare project timelines
      const timelineData = (projects || []).map(project => {
        const projectMilestonesList = (milestones || []).filter(m => m.project_id === project.id);
        const completedCount = projectMilestonesList.filter(m => m.status === 'completed').length;
        return {
          id: project.id,
          name: project.name,
          category: project.category || 'Allgemein',
          dateRange: formatDateRange(project.start_date, project.end_date),
          milestonesCompleted: completedCount,
          milestonesTotal: projectMilestonesList.length,
          progress: project.progress || 0
        };
      });
      setProjectTimelines(timelineData);

      // Prepare milestone list by project
      const milestoneListData = (projects || []).map(project => {
        const projectMilestonesList = (milestones || []).filter(m => m.project_id === project.id);
        return {
          projectId: project.id,
          projectName: project.name,
          category: project.category || 'Allgemein',
          milestones: projectMilestonesList.map(m => ({
            id: m.id,
            title: m.name,
            status: mapMilestoneStatus(m.status),
            dueDate: new Date(m.due_date),
            owner: m.responsible_user || 'Nicht zugewiesen',
            deliverables: m.deliverables || []
          }))
        };
      }).filter(p => p.milestones.length > 0 || true); // Include all projects

      setProjectMilestones(milestoneListData);

    } catch (error) {
      console.error('Error loading planning data:', error);
      toast.error('Fehler beim Laden der Planungsdaten');
    } finally {
      setLoading(false);
    }
  };

  const mapProjectStatus = (status: string): 'active' | 'at-risk' | 'delayed' | 'planning' => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return 'active';
      case 'at_risk':
        return 'at-risk';
      case 'delayed':
      case 'overdue':
        return 'delayed';
      default:
        return 'planning';
    }
  };

  const mapMilestoneStatus = (status: string): 'completed' | 'in-progress' | 'upcoming' => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in_progress':
        return 'in-progress';
      default:
        return 'upcoming';
    }
  };

  const formatDateRange = (startDate?: string, endDate?: string): string => {
    if (!startDate && !endDate) return 'Kein Zeitraum';
    const start = startDate ? new Date(startDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : '?';
    const end = endDate ? new Date(endDate).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }) : '?';
    return `${start} - ${end}`;
  };

  const handleAddMilestone = (projectId: string) => {
    toast.info('Meilenstein hinzufügen - Funktion wird implementiert');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planung
          </CardTitle>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Meilenstein hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <PlanningStatsCards stats={stats} />
        
        <PlanningViewTabs activeView={activeView} onViewChange={setActiveView} />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeView === 'gantt' && (
              <GanttView projects={ganttProjects} />
            )}
            {activeView === 'timeline' && (
              <TimelineView
                upcomingMilestones={upcomingMilestones}
                projectTimelines={projectTimelines}
              />
            )}
            {activeView === 'milestone-list' && (
              <MilestoneListView
                projectMilestones={projectMilestones}
                onAddMilestone={handleAddMilestone}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnterprisePlanningTab;
