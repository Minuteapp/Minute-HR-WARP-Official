
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { Draggable } from '@hello-pangea/dnd';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { CheckCircle, MessageSquare, Paperclip } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

export const ProjectCard = ({ project, index, onClick }: ProjectCardProps) => {
  const getCategoryLabel = () => {
    // Simulieren von Kategorien basierend auf vorhandenen Projekteigenschaften
    const categories = ["Front-End", "Back-End", "UI/UX Design", "API", "Database"];
    const randomIndex = Math.abs(project.id.charCodeAt(0)) % categories.length;
    return categories[randomIndex];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Front-End":
        return "bg-blue-100 text-blue-700";
      case "Back-End":
        return "bg-purple-100 text-purple-700";
      case "UI/UX Design":
        return "bg-pink-100 text-pink-700";
      case "API":
        return "bg-green-100 text-green-700";
      case "Database":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityBadge = () => {
    switch (project.priority) {
      case 'high':
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">Hoch</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Niedrig</Badge>;
      default:
        return null;
    }
  };

  // Erstellen einer Projekt-ID aus den ersten Buchstaben des Projektnamens + Zufallszahl
  const projectID = `P-${Math.floor(Math.abs(project.id.charCodeAt(0)) % 1000)}`;
  const category = getCategoryLabel();
  const categoryColor = getCategoryColor(category);

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer ${
            snapshot.isDragging ? 'opacity-75 shadow-lg' : ''
          }`}
          onClick={onClick}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <Badge className={categoryColor + " text-xs font-normal"}>{category}</Badge>
              <span className="text-xs text-gray-500 ml-2">{projectID}</span>
            </div>
            {project.progress === 100 && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" /> Done
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
          
          {project.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
          )}
          
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {/* Simulieren von Teammitgliedern mit Platzhalterbuchstaben */}
              {[...Array(Math.min(3, (project.team_members?.length || 0) + 1))].map((_, i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              
              {(project.team_members?.length || 0) > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-white">
                  +{(project.team_members?.length || 0) - 2}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 text-xs text-gray-500">
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                {Math.floor(Math.abs(project.id.charCodeAt(1)) % 10)}
              </div>
              <div className="flex items-center">
                <Paperclip className="h-3.5 w-3.5 mr-1" />
                {Math.floor(Math.abs(project.id.charCodeAt(2)) % 5)}
              </div>
            </div>
          </div>
          
          {project.dueDate && (
            <div className="mt-2 text-xs text-gray-500">
              Fällig {formatDistanceToNow(new Date(project.dueDate), { addSuffix: true, locale: de })}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
