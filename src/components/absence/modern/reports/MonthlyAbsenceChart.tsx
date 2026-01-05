import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { absenceReportsService } from '@/services/absenceReportsService';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

interface MonthlyAbsenceChartProps {
  year: string;
  department: string;
}

export const MonthlyAbsenceChart = ({ year, department }: MonthlyAbsenceChartProps) => {
  const [showAllStatus, setShowAllStatus] = useState(false);
  const { companyId } = useCompanyId();

  // Lade genehmigte Abwesenheiten (Standard)
  const { data: approvedData = [], isLoading: isLoadingApproved } = useQuery({
    queryKey: ['monthly-absences', year, department],
    queryFn: () => absenceReportsService.getMonthlyAbsences(parseInt(year), department)
  });

  // Lade alle Abwesenheiten (inkl. pending)
  const { data: allStatusData = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['monthly-absences-all-status', year, department, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      let query = supabase
        .from('absence_requests')
        .select('type, start_date, end_date, department, status')
        .eq('company_id', companyId)
        .gte('start_date', startDate)
        .lte('end_date', endDate);
      
      if (department && department !== 'all' && department !== 'all-employees') {
        query = query.eq('department', department);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Gruppiere nach Monat und Typ
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(parseInt(year), i).toLocaleString('de', { month: 'short' }),
        vacation: 0,
        sick: 0,
        homeoffice: 0,
        other: 0,
        total: 0,
        pending: 0
      }));
      
      data?.forEach(absence => {
        const month = new Date(absence.start_date).getMonth();
        
        // Berechne Arbeitstage
        const start = new Date(absence.start_date);
        const end = new Date(absence.end_date);
        let days = 0;
        const current = new Date(start);
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) days++;
          current.setDate(current.getDate() + 1);
        }
        
        if (absence.status === 'pending') {
          monthlyData[month].pending += days;
        }
        
        if (absence.type === 'vacation') {
          monthlyData[month].vacation += days;
        } else if (absence.type === 'sick_leave') {
          monthlyData[month].sick += days;
        } else if (absence.type === 'business_trip') {
          monthlyData[month].homeoffice += days;
        } else {
          monthlyData[month].other += days;
        }
        
        monthlyData[month].total += days;
      });
      
      return monthlyData;
    },
    enabled: showAllStatus && !!companyId
  });

  const monthlyData = showAllStatus ? allStatusData : approvedData;
  const isLoading = showAllStatus ? isLoadingAll : isLoadingApproved;

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  // Prüfe ob überhaupt Daten vorhanden sind
  const hasAnyData = monthlyData.some(m => m.total > 0);
  const hasOnlyPending = !hasAnyData && allStatusData.some(m => m.total > 0);

  if (isLoading) {
    return <div className="text-center p-4 text-muted-foreground">Lädt...</div>;
  }

  if (!hasAnyData && !showAllStatus) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="show-all-status"
              checked={showAllStatus}
              onCheckedChange={setShowAllStatus}
            />
            <Label htmlFor="show-all-status" className="text-sm">Alle Status anzeigen</Label>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-muted/30 rounded-lg">
          <AlertCircle className="h-8 w-8 mb-2 text-orange-500" />
          <p className="font-medium">Keine genehmigten Abwesenheiten</p>
          <p className="text-sm text-center mt-1">
            Für {year} wurden noch keine Abwesenheiten genehmigt.
          </p>
          {hasOnlyPending && (
            <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
              <Info className="h-4 w-4" />
              <span>Aktivieren Sie "Alle Status anzeigen" um ausstehende Anträge zu sehen.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="show-all-status"
            checked={showAllStatus}
            onCheckedChange={setShowAllStatus}
          />
          <Label htmlFor="show-all-status" className="text-sm">Alle Status anzeigen</Label>
        </div>
        {showAllStatus && (
          <span className="text-xs text-muted-foreground">Inkl. ausstehender Anträge</span>
        )}
      </div>

      {monthlyData.map((month) => (
        <div key={month.month} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium w-12">{month.month}</span>
            <span className="text-muted-foreground">
              {month.total} Tage
              {showAllStatus && (month as any).pending > 0 && (
                <span className="text-yellow-600 ml-1">({(month as any).pending} ausstehend)</span>
              )}
            </span>
          </div>
          
          <div className="flex h-8 w-full rounded overflow-hidden bg-muted">
            {month.vacation > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${getPercentage(month.vacation, month.total)}%` }}
                title={`Urlaub: ${month.vacation} Tage`}
              />
            )}
            {month.sick > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${getPercentage(month.sick, month.total)}%` }}
                title={`Krankheit: ${month.sick} Tage`}
              />
            )}
            {month.homeoffice > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${getPercentage(month.homeoffice, month.total)}%` }}
                title={`Dienstreise: ${month.homeoffice} Tage`}
              />
            )}
            {month.other > 0 && (
              <div
                className="bg-orange-500 transition-all"
                style={{ width: `${getPercentage(month.other, month.total)}%` }}
                title={`Sonderurlaub: ${month.other} Tage`}
              />
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-4 pt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Urlaub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Krankheit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Dienstreise</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Sonderurlaub</span>
        </div>
      </div>
    </div>
  );
};
