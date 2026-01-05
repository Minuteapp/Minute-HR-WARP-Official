import { Card, CardContent } from "@/components/ui/card";

interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  unit?: string;
  measurement_type?: string;
}

interface GoalKeyResultCardProps {
  keyResult: KeyResult;
}

export const GoalKeyResultCard = ({ keyResult }: GoalKeyResultCardProps) => {
  const current = keyResult.current_value ?? 0;
  const target = keyResult.target_value ?? 100;
  const progress = target > 0 ? Math.round((current / target) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">{keyResult.title}</h4>
          <span className="text-xs text-muted-foreground">
            Messung: {keyResult.measurement_type === 'auto' ? 'Automatisch' : 'Manuell'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {current}/{target} {keyResult.unit || ''}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
