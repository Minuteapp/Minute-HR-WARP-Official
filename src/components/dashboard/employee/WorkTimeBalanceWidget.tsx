import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Clock, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const WorkTimeBalanceWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: timeBalance, isLoading } = useQuery({
    queryKey: ['employee-time-balance', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return null;

      const now = new Date();
      
      // Monatsbeginn und -ende
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Lade Zeiteinträge des aktuellen Monats
      const { data: monthEntries } = await supabase
        .from('time_entries')
        .select('start_time, end_time, break_minutes')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());

      // Berechne Monatsstunden
      let monthlyMinutes = 0;
      for (const entry of (monthEntries || [])) {
        if (entry.start_time && entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const diffMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
          const breakMinutes = entry.break_minutes || 0;
          monthlyMinutes += Math.max(0, diffMinutes - breakMinutes);
        }
      }

      const monthlyHours = Math.round(monthlyMinutes / 60 * 10) / 10;

      // Berechne letzte 4 Wochen
      const weeklyData: { week: string; hours: number }[] = [];
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const { data: weekEntries } = await supabase
          .from('time_entries')
          .select('start_time, end_time, break_minutes')
          .eq('user_id', user.id)
          .eq('company_id', companyId)
          .gte('start_time', weekStart.toISOString())
          .lte('start_time', weekEnd.toISOString());

        let weekMinutes = 0;
        for (const entry of (weekEntries || [])) {
          if (entry.start_time && entry.end_time) {
            const start = new Date(entry.start_time);
            const end = new Date(entry.end_time);
            const diffMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
            const breakMinutes = entry.break_minutes || 0;
            weekMinutes += Math.max(0, diffMinutes - breakMinutes);
          }
        }

        // KW berechnen
        const weekNum = getWeekNumber(weekStart);
        weeklyData.push({
          week: `KW ${weekNum}`,
          hours: Math.round(weekMinutes / 60 * 10) / 10
        });
      }

      return {
        monthlyHours,
        monthlyTarget: 160, // Standard: 40h/Woche * 4 Wochen
        weeklyData: weeklyData.reverse()
      };
    },
    enabled: !!companyId
  });

  const hasData = timeBalance && (timeBalance.monthlyHours > 0 || timeBalance.weeklyData.some(w => w.hours > 0));

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Scale className="h-4 w-4 text-blue-600" />
          Arbeitszeitbilanz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Keine Zeitdaten vorhanden</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 text-center">
                <Clock className="h-3 w-3 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-bold text-blue-600">{timeBalance?.monthlyHours || 0}h</div>
                <p className="text-[10px] text-muted-foreground">Diesen Monat</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-center">
                <Calendar className="h-3 w-3 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-bold text-green-600">
                  {timeBalance?.monthlyHours || 0}h / {timeBalance?.monthlyTarget || 160}h
                </div>
                <p className="text-[10px] text-muted-foreground">Monatsziel</p>
              </div>
            </div>

            {timeBalance?.weeklyData && timeBalance.weeklyData.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Letzte Wochen</p>
                {timeBalance.weeklyData.map((week, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1">
                    <span className="text-muted-foreground">{week.week}</span>
                    <span className={week.hours > 40 ? 'text-amber-600 font-medium' : 'text-foreground'}>
                      {week.hours}h
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Hilfsfunktion für Kalenderwoche
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
