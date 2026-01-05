import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { WeekOverviewCard } from "./work-time/WeekOverviewCard";
import { OvertimeBalanceCard } from "./work-time/OvertimeBalanceCard";
import { ProjectTimeTrackingCard } from "./work-time/ProjectTimeTrackingCard";
import { CheckInHistoryCard } from "./work-time/CheckInHistoryCard";
import { ComplianceFooter } from "../profile/sections/ComplianceFooter";
import { 
  useEmployeeWeekTime, 
  useEmployeeOvertime, 
  useEmployeeProjectTime,
  useEmployeeCheckInHistory 
} from "@/hooks/time-tracking/useEmployeeWorkTime";

interface EmployeeWorkTimeTabContentProps {
  employeeId: string;
}

export const EmployeeWorkTimeTabContent = ({ employeeId }: EmployeeWorkTimeTabContentProps) => {
  const { data: weekTimeData, isLoading: isLoadingWeek, error: weekError } = useEmployeeWeekTime(employeeId);
  const { data: overtimeData, isLoading: isLoadingOvertime, error: overtimeError } = useEmployeeOvertime(employeeId);
  const { data: projectTimeData, isLoading: isLoadingProject, error: projectError } = useEmployeeProjectTime(employeeId);
  const { data: checkInHistory, isLoading: isLoadingHistory, error: historyError } = useEmployeeCheckInHistory(employeeId);

  const isLoading = isLoadingWeek || isLoadingOvertime || isLoadingProject || isLoadingHistory;
  const hasError = weekError || overtimeError || projectError || historyError;
  
  // Verwende nur echte Daten aus der Datenbank, keine Mock-Daten
  const displayWeekTimeData = weekTimeData || [];
  const displayOvertimeData = overtimeData || [];
  const displayProjectTimeData = projectTimeData || [];
  const displayCheckInHistory = checkInHistory || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fehler beim Laden der Arbeitszeiten</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Die Arbeitszeit-Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {weekError?.message || overtimeError?.message || projectError?.message || historyError?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prüfen ob überhaupt Daten vorhanden sind
  const hasAnyData = displayWeekTimeData.length > 0 || 
                     displayOvertimeData.length > 0 || 
                     displayProjectTimeData.length > 0 || 
                     displayCheckInHistory.length > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Arbeitszeit-Daten vorhanden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Für diesen Mitarbeiter wurden noch keine Arbeitszeiten erfasst.
            </p>
          </CardContent>
        </Card>
        <ComplianceFooter />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Week Overview + Overtime Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeekOverviewCard 
          timeEntries={displayWeekTimeData} 
          targetHoursPerDay={8}
        />
        <OvertimeBalanceCard 
          overtimeEntries={displayOvertimeData} 
        />
      </div>

      {/* Project Time Tracking */}
      <ProjectTimeTrackingCard 
        projectTimeData={displayProjectTimeData} 
      />

      {/* Check-In History */}
      <CheckInHistoryCard 
        checkInHistory={displayCheckInHistory} 
      />

      {/* Compliance Footer */}
      <ComplianceFooter />
    </div>
  );
};
