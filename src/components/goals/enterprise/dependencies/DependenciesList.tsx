import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DependencyCard } from "./DependencyCard";

export const DependenciesList = () => {
  const { data: dependencies = [], isLoading } = useQuery({
    queryKey: ['goal-dependencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_dependencies')
        .select(`
          *,
          source_goal:goals!goal_dependencies_source_goal_id_fkey(id, title, owner_name, progress),
          target_goal:goals!goal_dependencies_target_goal_id_fkey(id, title, owner_name, progress)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Alle Abhängigkeiten</h3>
        <p className="text-muted-foreground">Lade Abhängigkeiten...</p>
      </div>
    );
  }

  if (dependencies.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Alle Abhängigkeiten</h3>
        <p className="text-muted-foreground">Keine Abhängigkeiten definiert.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Alle Abhängigkeiten</h3>
      <div className="space-y-3">
        {dependencies.map((dep: any) => (
          <DependencyCard
            key={dep.id}
            sourceGoal={{
              title: dep.source_goal?.title || 'Unbekanntes Ziel',
              owner: dep.source_goal?.owner_name || 'Unbekannt',
              progress: dep.source_goal?.progress || 0
            }}
            targetGoal={{
              title: dep.target_goal?.title || 'Unbekanntes Ziel',
              owner: dep.target_goal?.owner_name || 'Unbekannt',
              progress: dep.target_goal?.progress || 0
            }}
            dependencyType={dep.dependency_type}
            impactLevel={dep.impact_level || 'medium'}
          />
        ))}
      </div>
    </div>
  );
};
