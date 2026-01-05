import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OKRGoalCard } from "./OKRGoalCard";
import { Skeleton } from "@/components/ui/skeleton";

interface OKRsGridProps {
  levelFilter: string;
  typeFilter: string;
  onEditGoal?: (id: string) => void;
}

export const OKRsGrid = ({ levelFilter, typeFilter, onEditGoal }: OKRsGridProps) => {
  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['goals', levelFilter, typeFilter],
    queryFn: async () => {
      let query = supabase.from('goals').select('*').order('created_at', { ascending: false });
      
      if (levelFilter !== 'all') {
        query = query.eq('goal_level', levelFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('goal_type', typeFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: keyResults = [], isLoading: loadingKRs } = useQuery({
    queryKey: ['key_results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('key_results')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingGoals || loadingKRs;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Keine Ziele gefunden. Erstellen Sie ein neues Ziel.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const goalKeyResults = keyResults
          .filter(kr => kr.goal_id === goal.id)
          .map(kr => ({
            id: kr.id,
            title: kr.title,
            current_value: kr.current_value || 0,
            target_value: kr.target_value || 0,
            unit: kr.unit || '',
            measurement_type: (kr.measurement_type || 'manual') as 'automatic' | 'manual',
          }));

        return (
          <OKRGoalCard
            key={goal.id}
            id={goal.id}
            title={goal.title}
            description={goal.description || undefined}
            type={goal.goal_type || 'operational'}
            ownerName={goal.owner_name || undefined}
            endDate={goal.end_date || undefined}
            progress={goal.progress || 0}
            status={goal.status || 'on_track'}
            keyResults={goalKeyResults}
            onEdit={onEditGoal}
          />
        );
      })}
    </div>
  );
};
