import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InterviewFeedbackCard from './InterviewFeedbackCard';

interface Interview {
  id: string;
  candidate_name: string;
  job_title: string;
  interview_date: string;
  round: number;
  interviewers: string[];
}

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

interface InterviewDetailViewProps {
  interview: Interview;
  feedbacks: Feedback[];
  onBack: () => void;
  onComplete: (id: string) => void;
}

const InterviewDetailView = ({ interview, feedbacks, onBack, onComplete }: InterviewDetailViewProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{interview.candidate_name}</h2>
            <p className="text-sm text-muted-foreground">
              {interview.job_title} • Runde {interview.round}
            </p>
          </div>
        </div>
        <Button onClick={() => onComplete(interview.id)}>
          <Check className="h-4 w-4 mr-2" />
          Abschließen
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-lg">Bewertungen</h3>
        {feedbacks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Noch keine Bewertungen vorhanden.
          </p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <InterviewFeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetailView;
