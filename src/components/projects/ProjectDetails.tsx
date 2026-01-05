
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MilestoneList } from "./MilestoneList";
import { TeamMemberList } from "./TeamMemberList";
import { DocumentList } from "./DocumentList";
import { ProjectSettings } from "./ProjectSettings";
import { useState } from "react";
import { isValidUUID } from "@/utils/validationUtils";
import ProjectNotFound from "./ProjectNotFound";
import { SiteMapTab } from "./details/visual-tools/SiteMapTab";
import { UserFlowTab } from "./details/visual-tools/UserFlowTab";
import { MindMapTab } from "./details/visual-tools/MindMapTab";

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Checking if id is a valid UUID to prevent unnecessary queries
  const isValidId = id ? isValidUUID(id) : false;

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Transform the database object to match our Project type
      if (data) {
        const transformedProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          responsiblePerson: data.owner_id || '',
          startDate: data.start_date || '',
          dueDate: data.end_date || '',
          status: data.status as Project['status'],
          priority: data.priority as 'high' | 'medium' | 'low',
          budget: data.budget,
          costCenter: data.category || '',
          category: data.category || '',
          progress: data.progress || 0,
          teamMembers: data.team_members || [],
          createdAt: data.created_at || new Date().toISOString()
        };
        return transformedProject;
      }
      return null;
    },
    enabled: isValidId,
    retry: false,
  });

  if (isLoading) {
    return <div className="p-6">Lade Projektdetails...</div>;
  }

  if (!isValidId || error || !project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">{project.name}</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 overflow-x-auto">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="sitemap">Site Map</TabsTrigger>
              <TabsTrigger value="userflow">User Flow</TabsTrigger>
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              <TabsTrigger value="settings">Einstellungen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Beschreibung</h3>
                  <p className="text-gray-600">{project.description || 'Keine Beschreibung verfügbar.'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Projektdetails</h3>
                    <ul className="space-y-2">
                      <li><span className="font-medium">Status:</span> {project.status}</li>
                      <li><span className="font-medium">Priorität:</span> {project.priority}</li>
                      <li><span className="font-medium">Fortschritt:</span> {project.progress}%</li>
                      <li><span className="font-medium">Verantwortlich:</span> {project.responsiblePerson || 'Nicht zugewiesen'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Zeitplan</h3>
                    <ul className="space-y-2">
                      <li><span className="font-medium">Startdatum:</span> {project.startDate || 'Nicht festgelegt'}</li>
                      <li><span className="font-medium">Enddatum:</span> {project.dueDate || 'Nicht festgelegt'}</li>
                      <li><span className="font-medium">Budget:</span> {project.budget ? `${project.budget} €` : 'Nicht festgelegt'}</li>
                      <li><span className="font-medium">Kostenstelle:</span> {project.costCenter || 'Nicht zugewiesen'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="milestones">
              <MilestoneList projectId={project.id} />
            </TabsContent>
            
            <TabsContent value="team">
              <TeamMemberList projectId={project.id} />
            </TabsContent>
            
            <TabsContent value="documents">
              <DocumentList projectId={project.id} />
            </TabsContent>
            
            <TabsContent value="sitemap">
              <SiteMapTab project={project} />
            </TabsContent>
            
            <TabsContent value="userflow">
              <UserFlowTab project={project} />
            </TabsContent>
            
            <TabsContent value="mindmap">
              <MindMapTab project={project} />
            </TabsContent>
            
            <TabsContent value="settings">
              <ProjectSettings project={project} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
