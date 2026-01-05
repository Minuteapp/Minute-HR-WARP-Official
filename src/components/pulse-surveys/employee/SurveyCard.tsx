import { Clock, FileText, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SurveyCardProps {
  survey: {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    estimatedDuration: number;
    deadline?: string;
    completedAt?: string;
  };
  isCompleted?: boolean;
  onStartSurvey?: (survey: any) => void;
}

export const SurveyCard = ({ survey, isCompleted = false, onStartSurvey }: SurveyCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{survey.title}</CardTitle>
          <Badge 
            variant={isCompleted ? "success" : "warning"}
            className={isCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"}
          >
            {isCompleted ? "Abgeschlossen" : "Offen"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {survey.description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{survey.questionCount} Fragen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>~{survey.estimatedDuration} Min</span>
          </div>
          {survey.deadline && !isCompleted && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                Frist: {format(new Date(survey.deadline), "dd.MM.yyyy", { locale: de })}
              </span>
            </div>
          )}
          {survey.completedAt && isCompleted && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" />
              <span>
                {format(new Date(survey.completedAt), "dd.MM.yyyy", { locale: de })}
              </span>
            </div>
          )}
        </div>

        {!isCompleted && onStartSurvey && (
          <Button 
            className="w-full"
            onClick={() => onStartSurvey(survey)}
          >
            Umfrage starten
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
