import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palmtree } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const MyVacationWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: vacationData, isLoading } = useQuery({
    queryKey: ['employee-vacation', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return null;

      // Hole Mitarbeiter-ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!employee) return null;

      const currentYear = new Date().getFullYear();

      // Hole Urlaubskontingent
      const { data: quota } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('user_id', employee.id)
        .eq('quota_year', currentYear)
        .eq('absence_type', 'vacation')
        .maybeSingle();

      // Hole genehmigte Abwesenheiten
      const { data: approved } = await supabase
        .from('absence_requests')
        .select('start_date, end_date')
        .eq('user_id', employee.id)
        .eq('status', 'approved')
        .eq('type', 'vacation');

      // Hole geplante (pending) Abwesenheiten
      const { data: planned } = await supabase
        .from('absence_requests')
        .select('start_date, end_date')
        .eq('user_id', employee.id)
        .eq('status', 'pending')
        .eq('type', 'vacation');

      // Berechne Tage
      const calculateDays = (requests: any[]) => {
        if (!requests) return 0;
        return requests.reduce((sum, req) => {
          const start = new Date(req.start_date);
          const end = new Date(req.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);
      };

      const takenDays = calculateDays(approved || []);
      const plannedDays = calculateDays(planned || []);
      const totalDays = quota?.total_days || 30;
      const remainingDays = totalDays - takenDays - plannedDays;

      return {
        remaining: Math.max(0, remainingDays),
        taken: takenDays,
        planned: plannedDays,
        total: totalDays
      };
    },
    enabled: !!companyId
  });

  const remaining = vacationData?.remaining || 0;
  const taken = vacationData?.taken || 0;
  const planned = vacationData?.planned || 0;
  const total = vacationData?.total || 30;
  const usedProgress = ((taken + planned) / total) * 100;

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Palmtree className="h-4 w-4 text-primary" />
          Mein Urlaub
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
              <div className="text-4xl font-bold text-primary">{remaining}</div>
              <p className="text-xs text-muted-foreground mt-1">Verbleibende Tage</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-lg font-semibold">{taken}</div>
                <p className="text-[10px] text-muted-foreground">Genommen</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-lg font-semibold text-amber-600">{planned}</div>
                <p className="text-[10px] text-muted-foreground">Geplant</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-lg font-semibold">{total}</div>
                <p className="text-[10px] text-muted-foreground">Gesamt</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Verbraucht</span>
                <span className="font-medium">{taken + planned} / {total} Tage</span>
              </div>
              <Progress value={usedProgress} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
