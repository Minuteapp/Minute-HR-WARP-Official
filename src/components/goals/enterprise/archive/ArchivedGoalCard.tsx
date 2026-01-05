import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ArchivedGoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string | null;
    level?: string | null;
    progress?: number | null;
    owner_name?: string | null;
    target_date?: string | null;
    archived_at?: string | null;
    status?: string | null;
  };
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ArchivedGoalCard = ({ goal, onRestore, onDelete }: ArchivedGoalCardProps) => {
  const getLevelLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      company: 'Unternehmen',
      department: 'Bereich',
      team: 'Team',
      individual: 'Individuell'
    };
    return level ? labels[level] || level : 'Unbekannt';
  };

  const getLevelColor = (level: string | null) => {
    const colors: Record<string, string> = {
      company: 'bg-purple-100 text-purple-700 border-purple-200',
      department: 'bg-blue-100 text-blue-700 border-blue-200',
      team: 'bg-green-100 text-green-700 border-green-200',
      individual: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return level ? colors[level] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getLevelColor(goal.level)}>
                {getLevelLabel(goal.level)}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Abgeschlossen
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg">{goal.title}</h3>
            
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {goal.owner_name && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{goal.owner_name}</span>
                </div>
              )}
              {goal.target_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Abgeschlossen: {format(new Date(goal.target_date), 'dd.MM.yyyy', { locale: de })}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <span className="text-3xl font-bold text-green-600">
                {goal.progress || 100}%
              </span>
              <p className="text-xs text-muted-foreground">Fortschritt</p>
            </div>
            
            <div className="flex gap-2">
              {onRestore && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRestore(goal.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Wiederherstellen
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={goal.progress || 100} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
