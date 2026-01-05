import { Button } from '@/components/ui/button';

interface InterviewsHeaderProps {
  onPlanInterview: () => void;
  onSubmitFeedback: () => void;
}

const InterviewsHeader = ({ onPlanInterview, onSubmitFeedback }: InterviewsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Interviews & Bewertungen</h2>
        <p className="text-sm text-muted-foreground">
          Planung und Durchführung von Interviews mit strukturiertem Feedback
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPlanInterview}>
          Interview planen
        </Button>
        <Button onClick={onSubmitFeedback}>
          Bewertung abgeben
        </Button>
      </div>
    </div>
  );
};

export default InterviewsHeader;
