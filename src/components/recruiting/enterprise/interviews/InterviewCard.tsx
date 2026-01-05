import { Video, Calendar, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Interview {
  id: string;
  candidate_name: string;
  job_title: string;
  interview_date: string;
  duration_minutes?: number;
  round: number;
  interviewers: string[];
  interview_type?: string;
  status?: string;
}

interface InterviewCardProps {
  interview: Interview;
  onComplete: (id: string) => void;
  onClick: (interview: Interview) => void;
}

const InterviewCard = ({ interview, onComplete, onClick }: InterviewCardProps) => {
  const interviewDate = new Date(interview.interview_date);
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(interview)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Video className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {interview.candidate_name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {interview.job_title}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(interviewDate, 'dd.MM.yyyy HH:mm', { locale: de })}
              </span>
              {interview.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {interview.duration_minutes} Min
                </span>
              )}
              <span>Runde {interview.round}</span>
            </div>
            {interview.interviewers && interview.interviewers.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Interviewer: {interview.interviewers.join(', ')}
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(interview.id);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Abschließen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewCard;
