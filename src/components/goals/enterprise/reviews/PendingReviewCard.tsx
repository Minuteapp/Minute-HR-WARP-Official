import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface PendingReviewCardProps {
  goalTitle: string;
  ownerName: string;
  level: string;
  progress: number;
  lastReviewDate?: string;
  nextReviewDate: string;
  progressChange?: number;
}

export const PendingReviewCard = ({
  goalTitle,
  ownerName,
  level,
  progress,
  lastReviewDate,
  nextReviewDate,
  progressChange
}: PendingReviewCardProps) => {
  const levelConfig: Record<string, { label: string; className: string }> = {
    company: { label: "Unternehmen", className: "bg-blue-100 text-blue-700" },
    department: { label: "Bereich", className: "bg-green-100 text-green-700" },
    team: { label: "Team", className: "bg-purple-100 text-purple-700" },
    individual: { label: "Mitarbeiter", className: "bg-orange-100 text-orange-700" }
  };

  const config = levelConfig[level] || { label: level, className: "bg-gray-100 text-gray-700" };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
          <h4 className="font-semibold text-foreground mt-2">{goalTitle}</h4>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{ownerName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Review fällig: {format(new Date(nextReviewDate), 'dd.MM.yyyy', { locale: de })}</span>
            </div>
          </div>

          {lastReviewDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Letzter Review: {format(new Date(lastReviewDate), 'dd.MM.yyyy', { locale: de })}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Fortschritt</p>
          <p className="text-3xl font-bold text-foreground">{progress}%</p>
          {progressChange !== undefined && progressChange !== 0 && (
            <p className={`text-sm ${progressChange > 0 ? 'text-green-600' : 'text-destructive'}`}>
              {progressChange > 0 ? '+' : ''}{progressChange}% seit letztem Review
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
