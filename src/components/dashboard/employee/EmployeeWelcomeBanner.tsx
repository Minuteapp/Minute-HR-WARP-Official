import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const EmployeeWelcomeBanner: React.FC = () => {
  const { companyId } = useCompanyId();
  
  const { data: hoursWorked = 0, isLoading } = useQuery({
    queryKey: ['employee-today-hours', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return 0;

      // Heutige Zeiteinträge für den User abrufen
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: entries } = await supabase
        .from('time_entries')
        .select('start_time, end_time, break_minutes')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay);

      if (!entries || entries.length === 0) return 0;

      // Berechne Gesamtstunden (end_time - start_time) minus Pausen
      let totalMinutes = 0;
      for (const entry of entries) {
        if (entry.start_time) {
          const start = new Date(entry.start_time);
          const end = entry.end_time ? new Date(entry.end_time) : new Date();
          const diffMinutes = (end.getTime() - start.getTime()) / 1000 / 60;
          const breakMinutes = entry.break_minutes || 0;
          totalMinutes += Math.max(0, diffMinutes - breakMinutes);
        }
      }

      return Math.round(totalMinutes / 60 * 10) / 10; // Eine Dezimalstelle
    },
    enabled: !!companyId
  });

  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="bg-background border-primary/40 shadow-lg">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Willkommen zurück! 👋
              </h2>
              <p className="text-sm text-muted-foreground">{currentDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/80 rounded-lg px-4 py-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {isLoading ? (
                <span className="text-muted-foreground">Lädt...</span>
              ) : hoursWorked > 0 ? (
                <>Du hast heute bereits <span className="font-semibold text-primary">{hoursWorked} Stunden</span> gearbeitet</>
              ) : (
                <span className="text-muted-foreground">Noch keine Zeit erfasst</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
