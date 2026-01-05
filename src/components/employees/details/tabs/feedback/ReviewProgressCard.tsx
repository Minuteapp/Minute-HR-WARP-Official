import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ReviewProgressCardProps {
  review: {
    review_period_start: string;
    review_period_end: string;
    due_date?: string;
    status: string;
    metadata: {
      progress?: {
        completed: number;
        total: number;
        percentage: number;
      };
    };
  };
}

export const ReviewProgressCard = ({ review }: ReviewProgressCardProps) => {
  const progress = review.metadata?.progress || { completed: 0, total: 5, percentage: 0 };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Abgeschlossen</Badge>;
      case 'pending_signature':
        return <Badge variant="default" className="bg-yellow-500">Signatur ausstehend</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPeriodLabel = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    
    if (startMonth === 9 && endMonth === 11) return "Q4 2025 Review";
    if (startMonth === 6 && endMonth === 8) return "Q3 2025 Review";
    if (startMonth === 3 && endMonth === 5) return "Q2 2025 Review";
    if (startMonth === 0 && endMonth === 2) return "Q1 2025 Review";
    
    return `${format(startDate, 'MMM yyyy', { locale: de })} - ${format(endDate, 'MMM yyyy', { locale: de })}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {getPeriodLabel(review.review_period_start, review.review_period_end)}
          </CardTitle>
          {getStatusBadge(review.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {progress.completed} von {progress.total} Bewertungen abgeschlossen
            </span>
            <span className="font-semibold">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
        
        {review.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Abschluss geplant: {format(new Date(review.due_date), 'dd.MM.yyyy', { locale: de })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
