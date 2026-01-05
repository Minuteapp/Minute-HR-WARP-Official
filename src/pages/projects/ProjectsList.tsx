import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, DollarSign, Users, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/projects/useProjects";

export default function ProjectsList() {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
        return 'Planung';
      case 'completed':
        return 'Abgeschlossen';
      case 'on_hold':
        return 'Pausiert';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-blue-500 hover:bg-blue-600";
      case "completed":
        return "bg-purple-500 hover:bg-purple-600";
      case "on_hold":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">Keine Projekte vorhanden</p>
        <p className="text-sm text-muted-foreground">Erstellen Sie ein neues Projekt, um zu beginnen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.description || 'Keine Beschreibung'}</p>
              </div>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {getStatusText(project.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {project.responsiblePerson?.split(' ').map(n => n[0]).join('') || 'PM'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{project.responsiblePerson || 'Nicht zugewiesen'}</div>
                <div className="text-xs text-muted-foreground">Projektleiter</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>€{(project.budget || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{project.team_members?.length || 0} Team</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Eye className="w-4 h-4" />
                Ansehen
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-2"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <Edit className="w-4 h-4" />
                Bearbeiten
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
