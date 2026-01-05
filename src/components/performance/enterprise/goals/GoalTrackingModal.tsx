import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { User, Calendar, Flag, Plus, FileText } from "lucide-react";
import { GoalStatusIcon } from "./GoalStatusIcon";
import { GoalProgressBar } from "./GoalProgressBar";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

interface GoalTrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    description?: string;
    progress: number;
    status: string;
    due_date?: string;
    employee_name?: string;
  } | null;
  milestones: Milestone[];
  activities: Activity[];
  onProgressChange?: (progress: number) => void;
}

export const GoalTrackingModal = ({
  open,
  onOpenChange,
  goal,
  milestones,
  activities,
  onProgressChange
}: GoalTrackingModalProps) => {
  const [progress, setProgress] = useState(goal?.progress || 0);

  if (!goal) return null;

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Abgeschlossen</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">Im Plan</Badge>;
      case 'at_risk':
        return <Badge className="bg-orange-100 text-orange-700">Gefährdet</Badge>;
      default:
        return <Badge variant="secondary">{goal.status}</Badge>;
    }
  };

  const daysOverdue = goal.due_date 
    ? differenceInDays(new Date(), new Date(goal.due_date))
    : 0;

  const completedMilestones = milestones.filter(m => m.completed).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <GoalStatusIcon status={goal.status} className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl">{goal.title}</DialogTitle>
                {getStatusBadge()}
              </div>
              {goal.description && (
                <p className="text-muted-foreground">{goal.description}</p>
              )}
              {goal.employee_name && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{goal.employee_name}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Gesamtfortschritt</h3>
            <div className="space-y-3">
              <GoalProgressBar progress={progress} className="h-3" />
              <Slider
                value={[progress]}
                onValueChange={(value) => {
                  setProgress(value[0]);
                  onProgressChange?.(value[0]);
                }}
                max={100}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">0%</span>
                <span className="font-medium">{progress}%</span>
                <span className="text-muted-foreground">100%</span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Zeitplan
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fälligkeitsdatum</p>
                <p className="font-medium">
                  {goal.due_date 
                    ? format(new Date(goal.due_date), 'dd. MMMM yyyy', { locale: de })
                    : 'Nicht festgelegt'
                  }
                </p>
              </div>
              {daysOverdue > 0 && (
                <Badge className="bg-red-100 text-red-700">
                  {daysOverdue} Tage überfällig
                </Badge>
              )}
            </div>
          </div>

          {/* Milestones Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Meilensteine ({completedMilestones}/{milestones.length})
              </h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Meilenstein
              </Button>
            </div>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Meilensteine definiert
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      readOnly
                      className="rounded"
                    />
                    <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                      {milestone.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activities Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Aktivitäts-Verlauf ({activities.length})
              </h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Update
              </Button>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Aktivitäten erfasst
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(activity.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                    <span>{activity.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
