import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressHeader } from "../progress/ProgressHeader";
import { ProgressStatusCards } from "../progress/ProgressStatusCards";
import { ProgressDeviationChart } from "../progress/ProgressDeviationChart";
import { CriticalGoalsSection } from "../progress/CriticalGoalsSection";
import { Skeleton } from "@/components/ui/skeleton";

export const ProgressDeviationsTab = () => {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const onTrackGoals = goals.filter(g => g.status === 'on_track' || !g.status);
  const atRiskGoals = goals.filter(g => g.status === 'at_risk');
  const delayedGoals = goals.filter(g => g.status === 'delayed');

  // Calculate average deviation
  const goalsWithDeviation = goals.filter(g => g.target_progress && g.progress !== undefined);
  const totalDeviation = goalsWithDeviation.reduce((sum, g) => {
    return sum + ((g.progress || 0) - (g.target_progress || 0));
  }, 0);
  const avgDeviation = goalsWithDeviation.length > 0 
    ? Math.round(totalDeviation / goalsWithDeviation.length) 
    : 0;

  // Get critical goals (largest negative deviations)
  const criticalGoals = [...goals]
    .filter(g => (g.progress || 0) < (g.target_progress || 100))
    .sort((a, b) => {
      const devA = (a.progress || 0) - (a.target_progress || 100);
      const devB = (b.progress || 0) - (b.target_progress || 100);
      return devA - devB;
    })
    .slice(0, 5);

  // Chart data
  const chartData = goals.slice(0, 8).map(goal => ({
    name: goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title,
    current: goal.progress || 0,
    target: goal.target_progress || 100,
  }));

  return (
    <Card>
      <CardContent className="pt-6">
        <ProgressHeader />
        
        <ProgressStatusCards
          onTrackCount={onTrackGoals.length}
          atRiskCount={atRiskGoals.length}
          delayedCount={delayedGoals.length}
          averageDeviation={avgDeviation}
        />
        
        <ProgressDeviationChart data={chartData} />
        
        <CriticalGoalsSection goals={criticalGoals} />
      </CardContent>
    </Card>
  );
};
