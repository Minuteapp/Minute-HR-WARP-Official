
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectDetailTabs } from "./ProjectDetailTabs";
import { ProjectDetailOverview } from "./overview/ProjectDetailOverview";
import { ProjectMilestonesTab } from "./milestones/ProjectMilestonesTab";
import { ProjectTasksDetailTab } from "./tasks/ProjectTasksDetailTab";
import { ProjectRisksDetailTab } from "./risks/ProjectRisksDetailTab";

export type SubTabType = 'overview' | 'milestones' | 'tasks' | 'risks';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('overview');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Projektliste
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Das Projekt mit der ID "{id}" existiert nicht.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <ProjectDetailOverview project={project} />;
      case 'milestones':
        return <ProjectMilestonesTab projectId={project.id} />;
      case 'tasks':
        return <ProjectTasksDetailTab projectId={project.id} />;
      case 'risks':
        return <ProjectRisksDetailTab projectId={project.id} />;
      default:
        return <ProjectDetailOverview project={project} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Zurück-Link */}
      <div className="p-6 pb-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="text-muted-foreground hover:text-foreground p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Projektliste
        </Button>
      </div>

      {/* Header mit Tabs */}
      <div className="p-6 pt-4">
        <ProjectDetailTabs activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      </div>

      {/* Badges und Buttons */}
      <ProjectDetailHeader project={project} />

      {/* Tab Content */}
      <div className="p-6">
        {renderSubTabContent()}
      </div>
    </div>
  );
};
