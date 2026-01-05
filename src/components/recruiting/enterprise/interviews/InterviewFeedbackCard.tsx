import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Feedback {
  id: string;
  reviewer_name: string;
  reviewer_role?: string;
  recommendation: 'recommended' | 'neutral' | 'not_recommended';
  technical_skills: number;
  communication: number;
  culture_fit: number;
  experience: number;
  comment?: string;
  created_at: string;
}

interface InterviewFeedbackCardProps {
  feedback: Feedback;
}

const InterviewFeedbackCard = ({ feedback }: InterviewFeedbackCardProps) => {
  const averageRating = (
    (feedback.technical_skills + feedback.communication + feedback.culture_fit + feedback.experience) / 4
  ).toFixed(1);

  const getRecommendationBadge = () => {
    switch (feedback.recommendation) {
      case 'recommended':
        return <Badge className="bg-green-100 text-green-800">Empfohlen</Badge>;
      case 'not_recommended':
        return <Badge className="bg-red-100 text-red-800">Nicht empfohlen</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Neutral</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{feedback.reviewer_name}</h4>
              {getRecommendationBadge()}
            </div>
            <p className="text-xs text-muted-foreground">
              {feedback.reviewer_role} • {format(new Date(feedback.created_at), 'dd.MM.yyyy', { locale: de })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Durchschnitt</p>
            <p className="text-lg font-bold">{averageRating} / 5</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Technische Fähigkeiten</span>
            <StarRating rating={feedback.technical_skills} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Kommunikation</span>
            <StarRating rating={feedback.communication} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Culture Fit</span>
            <StarRating rating={feedback.culture_fit} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Erfahrung</span>
            <StarRating rating={feedback.experience} />
          </div>
        </div>

        {feedback.comment && (
          <p className="text-sm text-muted-foreground border-t pt-3">
            {feedback.comment}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewFeedbackCard;
