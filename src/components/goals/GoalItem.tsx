
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trash, Edit, CheckCircle, Calendar, Target, 
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Goal } from '@/types/goals';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface GoalItemProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onCompleteGoal?: (goalId: string) => void;
  onProgressUpdate?: (goalId: string, progress: number) => void;
  showActions?: boolean;
}

export const GoalItem: React.FC<GoalItemProps> = ({
  goal,
  onEdit,
  onDelete,
  onCompleteGoal,
  onProgressUpdate,
  showActions = true
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Status-Farbe bestimmen
  const getStatusColor = () => {
    switch (goal.status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      case 'deleted': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Priorität-Badge
  const getPriorityBadge = () => {
    switch (goal.priority) {
      case 'high':
        return <Badge variant="destructive">Hohe Priorität</Badge>;
      case 'medium':
        return <Badge variant="secondary">Mittlere Priorität</Badge>;
      case 'low':
        return <Badge variant="outline">Niedrige Priorität</Badge>;
      default:
        return null;
    }
  };
  
  // Berechnung der Tage bis zur Fälligkeit
  const getDaysRemaining = () => {
    const today = new Date();
    const dueDate = new Date(goal.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  
  return (
    <Card className="mb-4 overflow-hidden transition-all duration-200">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <h3 className="text-lg font-semibold">{goal.title}</h3>
            {getPriorityBadge()}
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(goal.due_date), 'PPP', { locale: de })}
            </span>
            
            {goal.category === 'team' && goal.team_id && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Team-Ziel
              </span>
            )}
            
            {goal.category === 'company' && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Unternehmensziel
              </span>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="ml-2 h-8 w-8 p-0"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Fortschritt: {goal.progress}%</span>
            {daysRemaining < 0 ? (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Überfällig
              </Badge>
            ) : daysRemaining <= 7 ? (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                {daysRemaining} Tage übrig
              </Badge>
            ) : null}
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-3">
            {goal.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Beschreibung:</h4>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </div>
            )}
            
            {goal.assigned_to && (
              <div>
                <h4 className="text-sm font-medium mb-1">Zugewiesen an:</h4>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Zugewiesener Benutzer</span>
                </div>
              </div>
            )}
            
            {goal.checklist && goal.checklist.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Checkliste:</h4>
                <ul className="space-y-1">
                  {goal.checklist.map((item: any, index: number) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle 
                        className={`h-4 w-4 mr-2 ${item.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} 
                      />
                      <span className={item.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                        {item.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {expanded && showActions && (
        <CardFooter className="p-4 pt-0 gap-2 flex-wrap">
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(goal)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Bearbeiten
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ziel bearbeiten</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onCompleteGoal && goal.status !== 'completed' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCompleteGoal(goal.id)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Abschließen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ziel als abgeschlossen markieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onProgressUpdate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newProgress = window.prompt("Neuer Fortschritt (0-100):", goal.progress.toString());
                      if (newProgress !== null) {
                        const progress = parseInt(newProgress, 10);
                        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                          onProgressUpdate(goal.id, progress);
                        }
                      }
                    }}
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Fortschritt
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fortschritt aktualisieren</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Möchten Sie dieses Ziel wirklich löschen?")) {
                        onDelete(goal.id);
                      }
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Löschen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ziel löschen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
