import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp } from "lucide-react";

interface FitnessMembership {
  provider: string;
  membership_type?: string;
  employer_contribution: number;
  employee_contribution: number;
  status: string;
  check_ins?: {
    [key: string]: number;
  };
}

interface FitnessCardProps {
  fitness?: FitnessMembership;
}

export const FitnessCard = ({ fitness }: FitnessCardProps) => {
  if (!fitness) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Fitness & Sport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Fitness-Benefits vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  // Aktueller Monat Check-ins
  const currentMonth = Object.keys(fitness.check_ins || {}).sort().reverse()[0];
  const currentCheckIns = fitness.check_ins?.[currentMonth] || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Fitness & Sport
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-lg">{fitness.provider}</div>
            {fitness.membership_type && (
              <Badge variant="secondary">{fitness.membership_type}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Mitgliedschaft aktiv
          </div>
          <div className="text-sm text-muted-foreground">
            Zugang zu über 6.000 Studios
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-sm text-muted-foreground">Arbeitgeberbeitrag</div>
            <div className="font-bold text-lg">
              {Number(fitness.employer_contribution).toFixed(2)} €
            </div>
            <div className="text-xs text-muted-foreground">/Monat</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Eigenbeitrag</div>
            <div className="font-bold text-lg">
              {Number(fitness.employee_contribution).toFixed(2)} €
            </div>
            <div className="text-xs text-muted-foreground">/Monat</div>
          </div>
        </div>

        {currentCheckIns > 0 && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Check-ins {currentMonth?.replace('_', ' ')}
                </div>
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {currentCheckIns} Besuche
                </div>
              </div>
            </div>
          </div>
        )}

        <Button className="w-full" variant="outline">
          Studios in meiner Nähe finden
        </Button>
      </CardContent>
    </Card>
  );
};
