import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const MyGoalsWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['employee-goals', companyId],
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

      // Hole Ziele des Mitarbeiters
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('company_id', companyId);

      const activeGoals = goals?.filter(g => g.status !== 'completed') || [];
      const achievedGoals = goals?.filter(g => g.status === 'completed') || [];

      return {
        activeCount: activeGoals.length,
        achievedCount: achievedGoals.length,
        goals: activeGoals.slice(0, 3).map(g => ({
          title: g.title,
          progress: g.progress || 0,
          status: g.status || 'in-progress'
        }))
      };
    },
    enabled: !!companyId
  });

  const activeGoals = goalsData?.activeCount || 0;
  const achievedGoals = goalsData?.achievedCount || 0;
  const goals = goalsData?.goals || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-300">On Track</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-300">In Arbeit</Badge>;
      case 'delayed':
        return <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-300">Verzögert</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Offen</Badge>;
    }
  };

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Meine Ziele
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-2xl font-bold text-primary">{activeGoals}</div>
                <p className="text-[10px] text-muted-foreground">Aktive Ziele</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{achievedGoals}</div>
                  <p className="text-[10px] text-muted-foreground">Erreicht</p>
                </div>
              </div>
            </div>

            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate flex-1">{goal.title}</span>
                      {getStatusBadge(goal.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground w-8">{goal.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">Keine Ziele vorhanden</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
