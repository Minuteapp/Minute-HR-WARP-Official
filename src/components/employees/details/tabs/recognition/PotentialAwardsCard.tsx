import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { PotentialAward } from "@/integrations/supabase/hooks/useEmployeeRecognition";

interface PotentialAwardsCardProps {
  potentials?: PotentialAward[];
}

export const PotentialAwardsCard = ({ potentials = [] }: PotentialAwardsCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Potenzielle Auszeichnungen {new Date().getFullYear()}/{new Date().getFullYear() + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {potentials.map((award) => (
          <div key={award.id} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold">{award.award_name}</h4>
                {award.award_category && (
                  <div className="text-sm text-muted-foreground">{award.award_category}</div>
                )}
              </div>
              {award.probability_score && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{award.probability_score}%</div>
                  <div className="text-xs text-muted-foreground">Wahrscheinlichkeit</div>
                </div>
              )}
            </div>
            
            {award.progress_percentage !== null && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Fortschritt</span>
                  <span className="text-xs font-semibold">{award.progress_percentage}%</span>
                </div>
                <Progress value={award.progress_percentage} className="h-2" />
              </div>
            )}
            
            {award.criteria_description && (
              <p className="text-sm text-muted-foreground">{award.criteria_description}</p>
            )}
          </div>
        ))}

        {potentials.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Keine potenziellen Auszeichnungen vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
