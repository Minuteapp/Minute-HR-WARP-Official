import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

export const ReportByImpactTable = () => {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals-for-impact-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: dependencies = [] } = useQuery({
    queryKey: ['dependencies-for-impact-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_dependencies')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const goalsWithImpact = goals.map(goal => {
    const outgoing = dependencies.filter(d => d.source_goal_id === goal.id).length;
    const incoming = dependencies.filter(d => d.target_goal_id === goal.id).length;
    const impactScore = outgoing * 2 + incoming;
    
    return {
      ...goal,
      outgoing,
      incoming,
      impactScore
    };
  }).sort((a, b) => b.impactScore - a.impactScore);

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      company: 'Unternehmen',
      department: 'Bereich',
      team: 'Team',
      individual: 'Individuell'
    };
    return labels[level] || level;
  };

  const getImpactBadge = (score: number) => {
    if (score >= 5) return { label: 'Hoch', className: 'bg-red-100 text-red-700 border-red-200' };
    if (score >= 2) return { label: 'Mittel', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'Niedrig', className: 'bg-green-100 text-green-700 border-green-200' };
  };

  if (goalsWithImpact.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Keine Ziele vorhanden</h3>
        <p className="text-muted-foreground">
          Erstellen Sie Ziele und Abhängigkeiten für die Impact-Analyse.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Ziel</TableHead>
            <TableHead className="font-semibold">Ebene</TableHead>
            <TableHead className="font-semibold">Fortschritt</TableHead>
            <TableHead className="text-center font-semibold">Ausgehende Abh.</TableHead>
            <TableHead className="text-center font-semibold">Eingehende Abh.</TableHead>
            <TableHead className="font-semibold">Impact Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goalsWithImpact.slice(0, 10).map((goal) => {
            const impactBadge = getImpactBadge(goal.impactScore);
            return (
              <TableRow key={goal.id}>
                <TableCell>
                  <div>
                    <div className="font-medium max-w-xs truncate">{goal.title}</div>
                    <div className="text-sm text-muted-foreground">{goal.owner_name || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getLevelLabel(goal.level || '')}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress || 0} className="h-2 w-20" />
                    <span className="text-sm">{goal.progress || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                    {goal.outgoing}
                  </span>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {goal.incoming}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={impactBadge.className}>
                    {impactBadge.label} ({goal.impactScore})
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
