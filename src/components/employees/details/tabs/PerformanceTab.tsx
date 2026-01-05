import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Info } from "lucide-react";
import { useEmployeePerformanceData, usePerformanceHistory } from "@/integrations/supabase/hooks/useEmployeePerformance";
import { OverallPerformanceCard } from "./performance/OverallPerformanceCard";
import { Feedback360Card } from "./performance/Feedback360Card";
import { PerformanceHistoryChart } from "./performance/PerformanceHistoryChart";
import { DevelopmentPlanCard } from "./performance/DevelopmentPlanCard";
import { ReviewScheduleCard } from "./performance/ReviewScheduleCard";
import { SuccessionPlanningCard } from "./performance/SuccessionPlanningCard";
import { DetailedCompetenciesCard } from "./performance/DetailedCompetenciesCard";

export const PerformanceTab = ({ employeeId }: { employeeId: string }) => {
  const { data, isLoading } = useEmployeePerformanceData(employeeId);
  const { data: history, isLoading: historyLoading } = usePerformanceHistory(employeeId);

  const performanceData = data || { reviews: [], feedback360: null, developmentPlans: [], succession: null };
  const historyData = history || [];

  if (isLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  // Prüfen ob überhaupt Performance-Daten vorhanden sind
  const hasAnyData = performanceData.reviews.length > 0 || 
                     performanceData.feedback360 || 
                     performanceData.developmentPlans.length > 0 ||
                     performanceData.succession ||
                     historyData.length > 0;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance & Entwicklung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Performance-Daten verfügbar</h3>
            <p className="text-muted-foreground max-w-md">
              Für diesen Mitarbeiter wurden noch keine Performance-Reviews oder Entwicklungspläne erstellt.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zeile 1: Performance + 360-Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverallPerformanceCard reviews={performanceData.reviews} />
        <Feedback360Card feedback360={performanceData.feedback360} />
      </div>

      {/* Zeile 2: Performance-Historie */}
      {historyData && historyData.length > 0 && (
        <PerformanceHistoryChart historyData={historyData} />
      )}

      {/* Zeile 3: IDP */}
      <DevelopmentPlanCard plans={performanceData.developmentPlans} />

      {/* Zeile 4: Review-Termine + Nachfolgeplanung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewScheduleCard />
        <SuccessionPlanningCard succession={performanceData.succession} />
      </div>

      {/* Zeile 5: Detaillierte Kompetenzen */}
      <DetailedCompetenciesCard />
    </div>
  );
};
