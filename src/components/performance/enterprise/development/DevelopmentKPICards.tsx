import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target, CheckSquare, Users } from "lucide-react";

interface DevelopmentKPICardsProps {
  trainings: number;
  goalAdjustments: number;
  completed: number;
  coaching: number;
}

export const DevelopmentKPICards = ({
  trainings,
  goalAdjustments,
  completed,
  coaching
}: DevelopmentKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainings}</p>
              <p className="text-sm text-muted-foreground">Schulungen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{goalAdjustments}</p>
              <p className="text-sm text-muted-foreground">Zielanpassungen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coaching}</p>
              <p className="text-sm text-muted-foreground">Coaching</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
