import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { RoadmapOverviewTab } from './tabs/RoadmapOverviewTab';
import { RoadmapManageTab } from './tabs/RoadmapManageTab';
import { RoadmapTimelineTab } from './tabs/RoadmapTimelineTab';
import { ProjectRoadmapsTab } from './tabs/ProjectRoadmapsTab';
import { TaskRoadmapsTab } from './tabs/TaskRoadmapsTab';
import { TeamRoadmapsTab } from './tabs/TeamRoadmapsTab';
import DependenciesRisksTab from './tabs/DependenciesRisksTab';
import CapacityProgressTab from './tabs/CapacityProgressTab';
import ArchiveHistoryTab from './tabs/ArchiveHistoryTab';

export const ModernRoadmapDashboard = () => {
  const { roadmaps, isLoading } = useRoadmaps();
  const { isSuperAdmin, isAdmin } = useRolePermissions();
  const [activeTab, setActiveTab] = useState('overview');

  // Mitarbeiter sehen nur eingeschränkte Tabs
  const isEmployee = !isSuperAdmin && !isAdmin;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Roadmaps werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600"><path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"/><path d="M12 13v8"/><path d="M12 3v3"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Roadmap</h1>
              <p className="text-sm text-muted-foreground">Strategische & operative Zeitplanung – Projekte & Aufgaben im Fokus</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6 flex-wrap">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Übersicht</TabsTrigger>
            <TabsTrigger value="manage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Verwalten</TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Zeitleiste</TabsTrigger>
            <TabsTrigger value="project-roadmaps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Projekte</TabsTrigger>
            <TabsTrigger value="task-roadmaps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Aufgaben</TabsTrigger>
            <TabsTrigger value="team-roadmaps" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Team</TabsTrigger>
            {!isEmployee && (
              <>
                <TabsTrigger value="dependencies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Risiken</TabsTrigger>
                <TabsTrigger value="capacity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Fortschritt</TabsTrigger>
                <TabsTrigger value="archive" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">Archiv</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <RoadmapOverviewTab />
          </TabsContent>
          
          <TabsContent value="manage" className="mt-6">
            <RoadmapManageTab />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <RoadmapTimelineTab />
          </TabsContent>
          
          <TabsContent value="project-roadmaps" className="mt-6">
            <ProjectRoadmapsTab />
          </TabsContent>
          
          <TabsContent value="task-roadmaps" className="mt-6">
            <TaskRoadmapsTab />
          </TabsContent>

          <TabsContent value="team-roadmaps" className="mt-6">
            <TeamRoadmapsTab />
          </TabsContent>
          
          {!isEmployee && (
            <>
              <TabsContent value="dependencies" className="mt-6">
                <DependenciesRisksTab />
              </TabsContent>
              
              <TabsContent value="capacity" className="mt-6">
                <CapacityProgressTab />
              </TabsContent>
              
              <TabsContent value="archive" className="mt-6">
                <ArchiveHistoryTab />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};
