import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceProgressBar } from "../common/PerformanceProgressBar";

export function TeamOverviewList() {
  const { data: teamPerformance, isLoading } = useQuery({
    queryKey: ["team-overview-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_performance")
        .select(`
          id,
          overall_score,
          overdue_reviews,
          team:teams(id, name)
        `)
        .order("overall_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const teamColors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-yellow-500",
    "bg-red-500"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teamPerformance || teamPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Keine Team-Performance-Daten vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team-Übersicht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamPerformance.map((tp, index) => (
          <div key={tp.id} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${teamColors[index % teamColors.length]}`} />
            <span className="text-sm font-medium flex-1 min-w-0 truncate">
              {(tp.team as any)?.name || "Unbekanntes Team"}
            </span>
            <span className="text-xs text-muted-foreground">Zielerreichung</span>
            {tp.overdue_reviews > 0 && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                {tp.overdue_reviews} Reviews
              </Badge>
            )}
            <div className="w-32">
              <PerformanceProgressBar value={tp.overall_score || 0} size="sm" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
