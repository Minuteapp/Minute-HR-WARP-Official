
import { Project } from "@/types/project.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2, Calendar, User, CheckCircle, Clock, Archive, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onTrash?: (id: string) => void;
  showArchivedOrTrash?: boolean;
}

export const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onArchive, 
  onTrash,
  showArchivedOrTrash = false
}: ProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Abgeschlossen</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Bearbeitung</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Geplant</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Unbekannt</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Niedrig</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">-</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Navigating to project:", project.id);
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Editing project:", project);
    onEdit(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Deleting project:", project.id);
    onDelete(project.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Archiving project:", project.id);
    if (onArchive) onArchive(project.id);
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Moving to trash:", project.id);
    if (onTrash) onTrash(project.id);
  };

  return (
    <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className={`border-l-4 p-4 ${
          project.priority === 'high' ? 'border-red-500' : 
          project.priority === 'medium' ? 'border-yellow-500' : 
          'border-green-500'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                {getStatusIcon(project.status)}
                <span className="mr-2">Status: {getStatusBadge(project.status)}</span>
                <span>Priorität: {getPriorityBadge(project.priority)}</span>
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              )}
              
              <div className="mt-3 mb-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Fortschritt</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {project.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {formatDate(project.start_date)}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Fällig: {formatDate(project.end_date)}</span>
                  </div>
                )}
                {project.owner_id && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Verantwortlich: {project.owner_id}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2 self-start">
              <Button size="sm" variant="outline" onClick={handleView}>
                <Eye size={16} className="mr-1" />
                Ansehen
              </Button>
              
              {!showArchivedOrTrash && project.status !== 'completed' && (
                <>
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Pencil size={16} className="mr-1" />
                    Bearbeiten
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleArchive}>
                        <Archive size={16} className="mr-2" />
                        Archivieren
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleTrash}>
                        <Trash2 size={16} className="mr-2" />
                        In Papierkorb
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-500 hover:text-red-700" 
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-1" />
                {project.status === 'completed' ? 'Endgültig löschen' : 'Löschen'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
