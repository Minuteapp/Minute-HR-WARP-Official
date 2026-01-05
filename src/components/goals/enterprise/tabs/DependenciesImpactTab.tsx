import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DependenciesHeader } from "../dependencies/DependenciesHeader";
import { DependenciesKPICards } from "../dependencies/DependenciesKPICards";
import { DependenciesList } from "../dependencies/DependenciesList";
import { ImpactAnalysisTable } from "../dependencies/ImpactAnalysisTable";
import { DependenciesInfoBox } from "../dependencies/DependenciesInfoBox";

export const DependenciesImpactTab = () => {
  const { data: dependencyCounts = { total: 0, blocked: 0, enabled: 0, influenced: 0 } } = useQuery({
    queryKey: ['goal-dependencies-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_dependencies')
        .select('dependency_type');
      
      if (error) throw error;

      const deps = data || [];
      return {
        total: deps.length,
        blocked: deps.filter(d => d.dependency_type === 'blocks').length,
        enabled: deps.filter(d => d.dependency_type === 'enables').length,
        influenced: deps.filter(d => d.dependency_type === 'influences').length
      };
    },
  });

  return (
    <div className="space-y-6">
      <DependenciesHeader />
      
      <DependenciesKPICards
        total={dependencyCounts.total}
        blocked={dependencyCounts.blocked}
        enabled={dependencyCounts.enabled}
        influenced={dependencyCounts.influenced}
      />

      <DependenciesList />

      <ImpactAnalysisTable />

      <DependenciesInfoBox />
    </div>
  );
};
