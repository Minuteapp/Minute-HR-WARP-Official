
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  Target,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Roadmap } from "@/hooks/useRoadmaps";

interface RoadmapCardProps {
  roadmap: Roadmap;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RoadmapCard = ({ roadmap, onView, onEdit, onDelete }: RoadmapCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'draft':
        return 'Entwurf';
      case 'archived':
        return 'Archiviert';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht festgelegt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            {roadmap.title}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(roadmap.status)}>
              {getStatusLabel(roadmap.status)}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="h-4 w-4 mr-2" />
              Anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {roadmap.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {roadmap.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Start: {formatDate(roadmap.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Ende: {formatDate(roadmap.end_date)}</span>
            </div>
          </div>
          
          {roadmap.strategic_objectives && roadmap.strategic_objectives.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {roadmap.strategic_objectives.slice(0, 3).map((objective: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {objective.title || `Ziel ${index + 1}`}
                </Badge>
              ))}
              {roadmap.strategic_objectives.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{roadmap.strategic_objectives.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <Button 
            onClick={onView}
            variant="outline" 
            size="sm" 
            className="w-full group-hover:bg-purple-50 group-hover:border-purple-200 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Details anzeigen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
