import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

interface DepartmentTeamsListProps { departmentId: string; departmentName: string; }

export function DepartmentTeamsList({ departmentId, departmentName }: DepartmentTeamsListProps) {
  const { data: teams, isLoading } = useQuery({
    queryKey: ["department-teams", departmentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_performance").select(`id, overall_score, team:teams(id, name)`).eq("department_id", departmentId).eq("period", "current");
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="mt-4 pt-4 border-t"><div className="animate-pulse h-20 bg-muted rounded" /></div>;
  if (!teams || teams.length === 0) return <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">Keine Teams in dieser Abteilung</div>;

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-medium mb-3">Teams in {departmentName}:</h4>
      <div className="space-y-2">
        {teams.map(tp => (
          <div key={tp.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
            <span className="text-sm font-medium flex-1">{(tp.team as any)?.name || "Unbekannt"}</span>
            <div className="w-32"><PerformanceProgressBar value={tp.overall_score || 0} size="sm" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
