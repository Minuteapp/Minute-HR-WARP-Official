import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kanban, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StandardPageLayout from "@/components/layout/StandardPageLayout";
import ProjectKanbanBoard from "@/components/projects/ProjectKanbanBoard";

export default function ProjectKanbanPage() {
  const navigate = useNavigate();

  const actions = (
    <Button 
      variant="outline" 
      onClick={() => navigate('/projects')}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Zurück zu Projekten
    </Button>
  );

  return (
    <StandardPageLayout
      title="Kanban-Board"
      subtitle="Agile Projektübersicht und Taskmanagement"
      actions={actions}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Kanban className="h-5 w-5" />
              Projekt Kanban-Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectKanbanBoard />
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}