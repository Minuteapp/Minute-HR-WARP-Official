
import React from "react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateDaysRemaining } from "@/lib/dateUtils";
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TimelineProjectProps {
  project: Project;
  today: Date;
}

export const TimelineProject = ({ project, today }: TimelineProjectProps) => {
  const navigate = useNavigate();
  
  // Prüfen, ob Start- und Enddatum gesetzt sind
  const hasValidDates = Boolean(project.startDate && project.dueDate);
  
  // Berechnung der verbleibenden Tage
  const daysRemaining = project.dueDate ? calculateDaysRemaining(project.dueDate) : null;
  
  // Berechnung des Status-Symbols
  const getStatusIcon = () => {
    if (!hasValidDates) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
    
    if (project.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (daysRemaining !== null && daysRemaining < 0) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    return <Clock className="h-5 w-5 text-blue-500" />;
  };
  
  // Berechnung der Hintergrundfarbe
  const getCardClasses = () => {
    if (!hasValidDates) {
      return "border-l-4 border-l-amber-500";
    }
    
    if (project.status === 'completed') {
      return "border-l-4 border-l-green-500";
    }
    
    if (daysRemaining !== null && daysRemaining < 0) {
      return "border-l-4 border-l-red-500";
    }
    
    return "border-l-4 border-l-blue-500";
  };
  
  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-DE');
    } catch {
      return 'Ungültiges Datum';
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={`flex border-b hover:bg-gray-50 cursor-pointer transition-colors ${getCardClasses()}`}
    >
      <div className="w-36 shrink-0 p-3 border-r">
        <div className="flex flex-col">
          <div className="flex items-start gap-2">
            {getStatusIcon()}
            <h3 className="font-medium text-sm line-clamp-2">{project.name}</h3>
          </div>
          <div className="mt-2">
            <Badge className={
              project.status === 'completed' ? "bg-green-100 text-green-800" :
              project.status === 'active' ? "bg-blue-100 text-blue-800" :
              "bg-amber-100 text-amber-800"
            }>
              {project.status === 'completed' ? 'Abgeschlossen' : 
               project.status === 'active' ? 'In Bearbeitung' : 'Geplant'}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 flex items-center mt-2">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>Details</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-3">
        <div className="h-full flex flex-col justify-between">
          <div className="space-y-2">
            {hasValidDates ? (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>
                  {formatDate(project.startDate!)} - {formatDate(project.dueDate!)}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-amber-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Kein Zeitraum definiert</span>
              </div>
            )}
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Fortschritt</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>
          </div>
          
          {project.description && (
            <p className="text-xs text-gray-500 mt-3 line-clamp-1">{project.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
