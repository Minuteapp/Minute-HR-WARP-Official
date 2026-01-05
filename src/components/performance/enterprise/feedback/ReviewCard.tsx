import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { ReviewTypeBadge } from "./ReviewTypeBadge";
import { FeedbackEntry } from "./FeedbackEntry";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Feedback {
  id: string;
  date: string;
  type: 'manager_to_employee' | 'self_reflection' | 'peer' | 'upward';
  strengths?: string;
  developmentAreas?: string;
  agreements?: string;
}

interface ReviewCardProps {
  review: {
    id: string;
    employee_name: string;
    reviewer_name?: string;
    status: string;
    review_type: string;
    period_start?: string;
    period_end?: string;
    scheduled_date?: string;
  };
  feedbacks: Feedback[];
  onAddFeedback: () => void;
}

export const ReviewCard = ({ review, feedbacks, onAddFeedback }: ReviewCardProps) => {
  const hasFeedback = feedbacks.length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ReviewStatusBadge status={review.status} />
              <ReviewTypeBadge type={review.review_type} />
            </div>
            
            <h4 className="font-semibold mb-1">{review.employee_name} – Review</h4>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {review.reviewer_name && (
                <span>Reviewer: {review.reviewer_name}</span>
              )}
              {review.period_start && review.period_end && (
                <span>
                  Zeitraum: {format(new Date(review.period_start), 'dd.MM.yyyy', { locale: de })} - {format(new Date(review.period_end), 'dd.MM.yyyy', { locale: de })}
                </span>
              )}
            </div>

            {hasFeedback ? (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <FeedbackEntry
                    key={feedback.id}
                    date={feedback.date}
                    type={feedback.type}
                    strengths={feedback.strengths}
                    developmentAreas={feedback.developmentAreas}
                    agreements={feedback.agreements}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-4 text-center">
                <p className="text-muted-foreground mb-3">Noch kein Feedback erfasst</p>
                <Button variant="outline" size="sm" onClick={onAddFeedback} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Feedback hinzufügen
                </Button>
              </div>
            )}
          </div>

          {review.scheduled_date && (
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Geplant für</p>
              <p className="font-medium">
                {format(new Date(review.scheduled_date), 'dd.MM.yyyy', { locale: de })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
