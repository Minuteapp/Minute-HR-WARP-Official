import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SurveyTemplate } from '@/lib/surveyTemplates';
import { cn } from '@/lib/utils';

interface SurveyTemplateCardProps {
  template: SurveyTemplate;
  isSelected: boolean;
  onClick: () => void;
}

export const SurveyTemplateCard = ({
  template,
  isSelected,
  onClick,
}: SurveyTemplateCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'border-primary border-2'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-3xl">{template.icon}</span>
          <Badge variant="secondary" className="text-xs">
            {template.questionCount} Fragen
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </CardContent>
    </Card>
  );
};
