import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { EmployeeAward } from "@/integrations/supabase/hooks/useEmployeeRecognition";

interface AwardsOverviewCardProps {
  awards?: EmployeeAward[];
  startYear?: number;
}

export const AwardsOverviewCard = ({ awards = [], startYear = 2019 }: AwardsOverviewCardProps) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  const totalAwards = awards.length;
  const thisYearAwards = awards.filter(a => a.year === currentYear).length;
  const lastYearAwards = awards.filter(a => a.year === lastYear).length;
  const yearDiff = thisYearAwards - lastYearAwards;
  
  const lastAward = awards[0];
  const lastAwardDate = lastAward ? new Date(lastAward.received_date).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '-';
  
  // Berechne Ranking (Top 8% basierend auf Awards)
  const ranking = totalAwards >= 15 ? "Top 8%" : totalAwards >= 10 ? "Top 15%" : "Top 25%";

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Trophy className="h-8 w-8 text-amber-600" />
          Auszeichnungen & Erfolge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gesamt-Awards */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Gesamt-Awards</div>
            <div className="text-3xl font-bold text-amber-600">{totalAwards}</div>
            <div className="text-xs text-muted-foreground mt-1">Seit Eintritt {startYear}</div>
          </div>

          {/* Dieses Jahr */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Dieses Jahr</div>
            <div className="text-3xl font-bold text-green-600">{thisYearAwards}</div>
            <div className="text-xs text-green-600 mt-1">
              {yearDiff > 0 ? `+${yearDiff}` : yearDiff} vs. {lastYear}
            </div>
          </div>

          {/* Letzte Auszeichnung */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Letzte Auszeichnung</div>
            <div className="text-lg font-semibold">{lastAwardDate}</div>
            <div className="text-xs text-muted-foreground mt-1 truncate">{lastAward?.award_name}</div>
          </div>

          {/* Ranking */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Ranking</div>
            <div className="text-3xl font-bold text-blue-600">{ranking}</div>
            <div className="text-xs text-muted-foreground mt-1">Im Unternehmen</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
