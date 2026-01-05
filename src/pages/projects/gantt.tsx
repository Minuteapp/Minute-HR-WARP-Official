
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase, ArrowLeft } from "lucide-react";
import { ProjectsNavigation } from "@/components/projects/ProjectsNavigation";
import { useLocation, useNavigate } from "react-router-dom";
import { GanttChartView } from "@/components/projects/gantt/GanttChartView";
import { useGanttProjects } from "@/hooks/projects/useGanttProjects";
import { ProjectSelector } from "@/components/projects/gantt/ProjectSelector";

export default function GanttPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, loading, selectedProject, selectedProjectData, handleProjectChange } = useGanttProjects();

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Gantt-Ansicht</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Projekten
          </Button>
        </div>
        
        <ProjectsNavigation currentPath={location.pathname} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Gantt-Chart Ansicht
            </CardTitle>
            <ProjectSelector 
              projects={projects}
              selectedProject={selectedProject}
              selectedProjectData={selectedProjectData}
              onProjectChange={handleProjectChange}
              loading={loading}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <GanttChartView 
            loading={loading}
            selectedProjectData={selectedProjectData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
