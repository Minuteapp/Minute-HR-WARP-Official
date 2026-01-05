import { Card, CardContent } from "@/components/ui/card";
import { GoalRiskBadge } from "../common/GoalRiskBadge";

interface GoalStatCardsProps {
  progress: number;
  targetProgress: number;
  forecastProgress?: number;
  riskLevel: string;
}

export const GoalStatCards = ({
  progress,
  targetProgress,
  forecastProgress,
  riskLevel
}: GoalStatCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold">{progress}%</p>
          <p className="text-sm text-muted-foreground">
            von {targetProgress}% Soll
          </p>
          <p className="text-xs text-muted-foreground mt-1">Fortschritt</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold">{forecastProgress ?? progress}%</p>
          <p className="text-sm text-muted-foreground">Voraussichtlich</p>
          <p className="text-xs text-muted-foreground mt-1">Prognose</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex justify-center mb-1">
            <GoalRiskBadge risk={riskLevel} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Risiko</p>
        </CardContent>
      </Card>
    </div>
  );
};
