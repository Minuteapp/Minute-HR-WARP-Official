
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Calendar, Target, AlertCircle, 
  CheckCircle, Clock, Edit, Save, X 
} from 'lucide-react';
import { Goal } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';
import { calculateDaysRemaining, calculateDateProgress } from '@/lib/dateUtils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface GoalProgressProps {
  goal: Goal;
  onProgressUpdate?: (progress: number, note?: string) => void;
  canEdit?: boolean;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ 
  goal, 
  onProgressUpdate,
  canEdit = true 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newProgress, setNewProgress] = useState(goal.progress.toString());
  const [progressNote, setProgressNote] = useState('');
  const { toast } = useToast();

  const daysRemaining = calculateDaysRemaining(goal.due_date);
  const dateProgress = calculateDateProgress(goal.start_date, goal.due_date);

  const handleSaveProgress = () => {
    const progress = parseInt(newProgress, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      toast({
        title: "Ungültiger Wert",
        description: "Der Fortschritt muss zwischen 0 und 100 liegen.",
        variant: "destructive"
      });
      return;
    }

    onProgressUpdate?.(progress, progressNote);
    setIsEditing(false);
    setProgressNote('');
  };

  const getStatusColor = () => {
    if (goal.status === 'completed') return 'text-green-600';
    if (daysRemaining < 0) return 'text-red-600';
    if (daysRemaining <= 7) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusIcon = () => {
    if (goal.status === 'completed') return CheckCircle;
    if (daysRemaining < 0) return AlertCircle;
    if (daysRemaining <= 7) return Clock;
    return Target;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fortschritt
          </div>
          {canEdit && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aktueller Fortschritt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Zielerreichung</span>
            <span className="text-lg font-bold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-3" />
        </div>

        {/* Zeitlicher Fortschritt */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Zeitlicher Fortschritt</span>
            <span className="text-sm text-muted-foreground">{dateProgress}%</span>
          </div>
          <Progress value={dateProgress} className="h-2" />
        </div>

        {/* Status und Termine */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Badge variant={goal.status === 'completed' ? 'default' : 'outline'}>
              {goal.status === 'active' ? 'Aktiv' : 
               goal.status === 'completed' ? 'Abgeschlossen' : 
               goal.status === 'archived' ? 'Archiviert' : 'Unbekannt'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Verbleibend</span>
            </div>
            <Badge variant={daysRemaining < 0 ? "destructive" : "outline"}>
              {daysRemaining < 0 ? `${Math.abs(daysRemaining)} Tage überfällig` : 
               daysRemaining === 0 ? 'Heute fällig' : 
               `${daysRemaining} Tage`}
            </Badge>
          </div>
        </div>

        {/* Termine */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Startdatum:</span>
            <span>{format(new Date(goal.start_date), 'PPP', { locale: de })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fälligkeitsdatum:</span>
            <span>{format(new Date(goal.due_date), 'PPP', { locale: de })}</span>
          </div>
        </div>

        {/* Fortschritt bearbeiten */}
        {isEditing && (
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Neuer Fortschritt (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                placeholder="0-100"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notiz (optional)</label>
              <Textarea
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Was wurde erreicht? Welche Schritte wurden unternommen?"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveProgress}>
                <Save className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsEditing(false);
                  setNewProgress(goal.progress.toString());
                  setProgressNote('');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
