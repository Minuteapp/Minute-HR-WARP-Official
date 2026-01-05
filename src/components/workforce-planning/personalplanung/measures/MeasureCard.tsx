import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, ExternalLink } from "lucide-react";
import { MeasureMilestones } from "./MeasureMilestones";
import { MeasureRisksBox } from "./MeasureRisksBox";

interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
}

interface Measure {
  id: string;
  title: string;
  description: string;
  status: 'in_progress' | 'planned' | 'completed';
  priority: 'high' | 'medium' | 'low';
  type: string;
  responsible: string;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
  integrations: string[];
  milestones: Milestone[];
  risks: string[];
}

interface MeasureCardProps {
  measure: Measure;
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string) => void;
}

export const MeasureCard = ({ measure, onViewDetails, onUpdateStatus }: MeasureCardProps) => {
  const statusConfig = {
    in_progress: { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-700' },
    planned: { label: 'Geplant', className: 'bg-gray-100 text-gray-700' },
    completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-700' }
  };

  const priorityConfig = {
    high: { label: 'Hoch', className: 'bg-red-100 text-red-600 border-red-200' },
    medium: { label: 'Mittel', className: 'bg-orange-100 text-orange-600 border-orange-200' },
    low: { label: 'Niedrig', className: 'bg-green-100 text-green-600 border-green-200' }
  };

  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{measure.title}</h3>
            <Badge className={statusConfig[measure.status].className}>
              {statusConfig[measure.status].label}
            </Badge>
            <Badge variant="outline" className={priorityConfig[measure.priority].className}>
              {priorityConfig[measure.priority].label}
            </Badge>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {measure.budget.toLocaleString('de-DE')} € Budget
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{measure.description}</p>

        {/* Info Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Typ:</span>
            <p className="font-medium">{measure.type}</p>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{measure.responsible}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{measure.startDate} - {measure.endDate}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {measure.integrations.map((integration, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {integration}
              </Badge>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Fortschritt</span>
            <span className="text-sm font-medium">{measure.progress}%</span>
          </div>
          <Progress value={measure.progress} className="h-2" />
        </div>

        {/* Milestones */}
        <div className="mb-4">
          <MeasureMilestones milestones={measure.milestones} />
        </div>

        {/* Risks */}
        {measure.risks.length > 0 && (
          <div className="mb-4">
            <MeasureRisksBox risks={measure.risks} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onViewDetails?.(measure.id)}
          >
            Details anzeigen
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onUpdateStatus?.(measure.id)}
          >
            Status aktualisieren
          </Button>
          <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
            <ExternalLink className="h-4 w-4 mr-1" />
            Recruiting öffnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
