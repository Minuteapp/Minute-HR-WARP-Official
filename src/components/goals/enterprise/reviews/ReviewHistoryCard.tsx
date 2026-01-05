import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ReviewHistoryCardProps {
  goalTitle: string;
  reviewDate: string;
  nextReviewDate?: string;
  previousProgress: number;
  newProgress: number;
  reviewerName: string;
  adjustments?: string;
  comments?: string;
}

export const ReviewHistoryCard = ({
  goalTitle,
  reviewDate,
  nextReviewDate,
  previousProgress,
  newProgress,
  reviewerName,
  adjustments,
  comments
}: ReviewHistoryCardProps) => {
  const progressDiff = newProgress - previousProgress;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-semibold text-foreground">{goalTitle}</h4>
            <p className="text-sm text-muted-foreground">
              Review am {format(new Date(reviewDate), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
        </div>
        {nextReviewDate && (
          <div className="text-sm text-muted-foreground text-right">
            <p>Nächster Review:</p>
            <p className="font-medium">{format(new Date(nextReviewDate), 'dd.MM.yyyy', { locale: de })}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Fortschritt</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{previousProgress}%</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{newProgress}%</span>
            <span className={`text-sm ${progressDiff >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              ({progressDiff >= 0 ? '+' : ''}{progressDiff}%)
            </span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">Reviewer</p>
          <p className="font-semibold">{reviewerName}</p>
        </div>
      </div>

      {adjustments && (
        <div className="mb-2">
          <p className="text-sm font-medium text-foreground">Anpassungen:</p>
          <p className="text-sm text-muted-foreground">{adjustments}</p>
        </div>
      )}

      {comments && (
        <div>
          <p className="text-sm font-medium text-foreground">Kommentare:</p>
          <p className="text-sm text-muted-foreground">{comments}</p>
        </div>
      )}
    </Card>
  );
};
