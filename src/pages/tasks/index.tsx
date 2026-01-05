import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, Bell, Settings, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProjectRoadmapView } from '@/components/tasks/ProjectRoadmapView';
import { OverviewView } from '@/components/tasks/OverviewView';
import { TeamTasksView } from '@/components/tasks/TeamTasksView';
import { KanbanBoardTab } from '@/components/tasks/tabs/KanbanBoardTab';
import { GanttTimelineTab } from '@/components/tasks/tabs/GanttTimelineTab';
import { ArchiveTab } from '@/components/tasks/tabs/ArchiveTab';
import { useTaskPermissions } from '@/hooks/useTaskPermissions';

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const permissions = useTaskPermissions();

  // Tab-Wechsel wenn aktueller Tab nicht mehr sichtbar
  useEffect(() => {
    const tabVisibility: Record<string, boolean> = {
      overview: permissions.canViewOverview,
      team: permissions.canViewTeamTasks,
      projects: permissions.canViewProjects,
      kanban: permissions.canViewKanban,
      gantt: permissions.canViewGantt,
      archive: permissions.canViewArchive,
    };

    if (!tabVisibility[activeTab]) {
      const firstVisibleTab = Object.entries(tabVisibility).find(([, visible]) => visible)?.[0];
      if (firstVisibleTab) {
        setActiveTab(firstVisibleTab);
      }
    }
  }, [permissions, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Aufgaben</h1>
              <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Aufgaben, Projekte und Workflows</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
            {permissions.canViewOverview && (
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Übersicht
              </TabsTrigger>
            )}
            {permissions.canViewTeamTasks && (
              <TabsTrigger 
                value="team" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Teamaufgaben
              </TabsTrigger>
            )}
            {permissions.canViewProjects && (
              <TabsTrigger 
                value="projects" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Projekt & Roadmap
              </TabsTrigger>
            )}
            {permissions.canViewKanban && (
              <TabsTrigger 
                value="kanban" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Kanban-Board
              </TabsTrigger>
            )}
            {permissions.canViewGantt && (
              <TabsTrigger 
                value="gantt" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Gantt & Timeline
              </TabsTrigger>
            )}
            {permissions.canViewArchive && (
              <TabsTrigger 
                value="archive" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3"
              >
                Archiv
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && permissions.canViewOverview && <OverviewView />}
          {activeTab === 'team' && permissions.canViewTeamTasks && <TeamTasksView />}
          {activeTab === 'projects' && permissions.canViewProjects && <ProjectRoadmapView />}
          {activeTab === 'kanban' && permissions.canViewKanban && <KanbanBoardTab />}
          {activeTab === 'gantt' && permissions.canViewGantt && <GanttTimelineTab />}
          {activeTab === 'archive' && permissions.canViewArchive && <ArchiveTab />}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
