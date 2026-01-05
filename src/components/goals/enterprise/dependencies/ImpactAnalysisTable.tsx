import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImpactScoreBadge } from "./ImpactScoreBadge";

export const ImpactAnalysisTable = () => {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals-with-impact'],
    queryFn: async () => {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .order('progress', { ascending: false });
      
      if (goalsError) throw goalsError;

      const { data: dependencies, error: depError } = await supabase
        .from('goal_dependencies')
        .select('*');
      
      if (depError) throw depError;

      // Calculate impact scores
      return (goalsData || []).map(goal => {
        const outgoing = (dependencies || []).filter(d => d.source_goal_id === goal.id).length;
        const incoming = (dependencies || []).filter(d => d.target_goal_id === goal.id).length;
        const impactScore = Math.min(100, outgoing * 20 + incoming * 10);
        
        return {
          ...goal,
          outgoing,
          incoming,
          impactScore
        };
      }).sort((a, b) => b.impactScore - a.impactScore).slice(0, 10);
    },
  });

  const getLevelBadge = (level: string) => {
    const config: Record<string, string> = {
      company: "bg-blue-100 text-blue-700",
      department: "bg-green-100 text-green-700",
      team: "bg-purple-100 text-purple-700",
      individual: "bg-orange-100 text-orange-700"
    };
    const labels: Record<string, string> = {
      company: "Unternehmen",
      department: "Bereich",
      team: "Team",
      individual: "Mitarbeiter"
    };
    return (
      <Badge variant="outline" className={config[level] || "bg-gray-100 text-gray-700"}>
        {labels[level] || level}
      </Badge>
    );
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Lade Wirkungsanalyse...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Wirkungsanalyse - Ziele mit größtem Impact</h3>
        <p className="text-sm text-muted-foreground">
          Sortiert nach Anzahl und Gewichtung ausgehender Abhängigkeiten
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ziel</TableHead>
            <TableHead>Ebene</TableHead>
            <TableHead>Fortschritt</TableHead>
            <TableHead className="text-center">Ausgehend</TableHead>
            <TableHead className="text-center">Eingehend</TableHead>
            <TableHead className="text-center">Impact Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Keine Ziele gefunden.
              </TableCell>
            </TableRow>
          ) : (
            goals.map((goal: any) => (
              <TableRow key={goal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">{goal.owner_name || 'Kein Owner'}</p>
                  </div>
                </TableCell>
                <TableCell>{getLevelBadge(goal.level)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress || 0} className="w-20 h-2" />
                    <span className="text-sm font-medium">{goal.progress || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold mx-auto">
                    {goal.outgoing}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">{goal.incoming}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <ImpactScoreBadge score={goal.impactScore} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
