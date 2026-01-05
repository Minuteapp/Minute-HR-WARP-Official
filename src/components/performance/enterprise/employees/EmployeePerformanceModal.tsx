import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";
import { TrendBadge } from "../common/TrendBadge";
import { DimensionScoreCard } from "../common/DimensionScoreCard";
import { Minus } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'completed';
}

interface EmployeePerformanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    position: string | null;
  } | null;
  overallScore: number;
  goalsScore: number;
  tasksScore: number;
  feedbackScore: number;
  developmentScore: number;
  trend: 'rising' | 'falling' | 'stable';
  goals: Goal[];
}

export const EmployeePerformanceModal = ({
  open,
  onOpenChange,
  employee,
  overallScore,
  goalsScore,
  tasksScore,
  feedbackScore,
  developmentScore,
  trend,
  goals
}: EmployeePerformanceModalProps) => {
  if (!employee) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-green-100 text-green-700">Im Plan</Badge>;
      case 'at_risk':
        return <Badge className="bg-orange-100 text-orange-700">Gefährdet</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Abgeschlossen</Badge>;
      default:
        return null;
    }
  };

  const getNormalBadge = () => {
    if (overallScore >= 75) return <Badge className="bg-green-100 text-green-700">Sehr gut</Badge>;
    if (overallScore >= 50) return <Badge variant="secondary">Normal</Badge>;
    return <Badge className="bg-red-100 text-red-700">Kritisch</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {employee.first_name} {employee.last_name}
          </DialogTitle>
          <p className="text-muted-foreground">{employee.position || 'Keine Position'}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance-Übersicht */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Performance-Übersicht</h3>
                <p className="text-sm text-muted-foreground">Letztes Quartal</p>
              </div>
              <div className="flex items-center gap-2">
                {getNormalBadge()}
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{overallScore}</p>
                <p className="text-sm text-muted-foreground">Gesamt-Score</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Minus className="h-4 w-4" />
                <span className="text-sm">
                  {trend === 'stable' ? 'Stabil' : trend === 'rising' ? 'Steigend' : 'Fallend'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DimensionScoreCard dimension="goals" score={goalsScore} />
              <DimensionScoreCard dimension="tasks" score={tasksScore} />
              <DimensionScoreCard dimension="feedback" score={feedbackScore} />
              <DimensionScoreCard dimension="development" score={developmentScore} />
            </div>
          </div>

          {/* Alle Ziele */}
          <div>
            <h3 className="font-semibold mb-3">Alle Ziele</h3>
            {goals.length === 0 ? (
              <p className="text-muted-foreground text-sm">Keine Ziele vorhanden</p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusBadge(goal.status)}
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <div className="flex items-center gap-3 w-32">
                      <PerformanceProgressBar value={goal.progress} className="flex-1" />
                      <span className="text-sm font-medium w-10 text-right">{goal.progress}%</span>
                    </div>
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
