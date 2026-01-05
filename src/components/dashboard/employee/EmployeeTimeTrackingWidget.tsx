import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Square } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const EmployeeTimeTrackingWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: timeData, isLoading } = useQuery({
    queryKey: ['employee-time-tracking', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return null;

      // Berechne Wochenstunden basierend auf time_entries (user_id, start_time, end_time)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const { data: weekEntries } = await supabase
        .from('time_entries')
        .select('start_time, end_time, break_minutes')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .gte('start_time', startOfWeek.toISOString());

      let weeklyMinutes = 0;
      for (const entry of (weekEntries || [])) {
        if (entry.start_time && entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const diffMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
          const breakMinutes = entry.break_minutes || 0;
          weeklyMinutes += Math.max(0, diffMinutes - breakMinutes);
        }
      }

      const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;

      return {
        weeklyHours,
        weeklyTarget: 40
      };
    },
    enabled: !!companyId
  });

  const weeklyHours = timeData?.weeklyHours || 0;
  const weeklyTarget = timeData?.weeklyTarget || 40;
  const weeklyProgress = (weeklyHours / weeklyTarget) * 100;

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Zeiterfassung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {weeklyHours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">Diese Woche</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" className="gap-1">
                <Pause className="h-3 w-3" />
                Pause
              </Button>
              <Button size="sm" variant="destructive" className="gap-1">
                <Square className="h-3 w-3" />
                Stoppen
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Wochenziel</span>
                <span className="font-medium">{weeklyHours.toFixed(1)}h / {weeklyTarget}h</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
