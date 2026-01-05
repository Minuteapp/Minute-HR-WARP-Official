import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

interface TeamGoalsDetailProps { teamId: string; }

export function TeamGoalsDetail({ teamId }: TeamGoalsDetailProps) {
  const { data: goals, isLoading } = useQuery({
    queryKey: ["team-goals-detail", teamId],
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("id, title, progress, status").eq("team_id", teamId).limit(3);
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="pt-3 border-t"><div className="animate-pulse h-16 bg-muted rounded" /></div>;
  if (!goals || goals.length === 0) return null;

  return (
    <div className="pt-3 border-t">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Target className="h-4 w-4" />Team-Ziele im Detail</h4>
      <div className="space-y-2">
        {goals.map(goal => (
          <div key={goal.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
            <span className="text-sm flex-1 truncate">{goal.title}</span>
            <div className="w-24"><PerformanceProgressBar value={goal.progress || 0} size="sm" /></div>
          </div>
        ))}
      </div>
      {goals.length >= 3 && <button className="text-sm text-primary mt-2">Weitere Ziele anzeigen</button>}
    </div>
  );
}
