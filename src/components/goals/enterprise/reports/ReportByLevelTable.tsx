import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LevelStats {
  level: string;
  levelLabel: string;
  total: number;
  avgProgress: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
  completed: number;
}

export const ReportByLevelTable = () => {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals-for-report-by-level'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const calculateStats = (): LevelStats[] => {
    const levels = ['company', 'department', 'team', 'individual'];
    const levelLabels: Record<string, string> = {
      company: 'Unternehmensziele',
      department: 'Bereichsziele',
      team: 'Teamziele',
      individual: 'Individuelle Ziele'
    };

    return levels.map(level => {
      const levelGoals = goals.filter(g => g.level === level);
      const total = levelGoals.length;
      const avgProgress = total > 0 
        ? Math.round(levelGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / total)
        : 0;
      const onTrack = levelGoals.filter(g => g.status === 'on_track').length;
      const atRisk = levelGoals.filter(g => g.status === 'at_risk').length;
      const delayed = levelGoals.filter(g => g.status === 'delayed' || g.status === 'behind').length;
      const completed = levelGoals.filter(g => g.status === 'completed').length;

      return {
        level,
        levelLabel: levelLabels[level],
        total,
        avgProgress,
        onTrack,
        atRisk,
        delayed,
        completed
      };
    });
  };

  const stats = calculateStats();
  const totals = stats.reduce((acc, s) => ({
    total: acc.total + s.total,
    avgProgress: acc.avgProgress + s.avgProgress,
    onTrack: acc.onTrack + s.onTrack,
    atRisk: acc.atRisk + s.atRisk,
    delayed: acc.delayed + s.delayed,
    completed: acc.completed + s.completed
  }), { total: 0, avgProgress: 0, onTrack: 0, atRisk: 0, delayed: 0, completed: 0 });

  const avgTotalProgress = stats.length > 0 
    ? Math.round(totals.avgProgress / stats.filter(s => s.total > 0).length) || 0
    : 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Ebene</TableHead>
            <TableHead className="text-center font-semibold">Gesamt</TableHead>
            <TableHead className="font-semibold">Ø Fortschritt</TableHead>
            <TableHead className="text-center font-semibold text-green-600">Im Plan</TableHead>
            <TableHead className="text-center font-semibold text-amber-600">Risiko</TableHead>
            <TableHead className="text-center font-semibold text-red-600">Verzögert</TableHead>
            <TableHead className="text-center font-semibold text-blue-600">Abgeschlossen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <TableRow key={stat.level}>
              <TableCell className="font-medium">{stat.levelLabel}</TableCell>
              <TableCell className="text-center">{stat.total}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={stat.avgProgress} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {stat.avgProgress}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center text-green-600 font-medium">{stat.onTrack}</TableCell>
              <TableCell className="text-center text-amber-600 font-medium">{stat.atRisk}</TableCell>
              <TableCell className="text-center text-red-600 font-medium">{stat.delayed}</TableCell>
              <TableCell className="text-center text-blue-600 font-medium">{stat.completed}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/30 font-semibold">
            <TableCell>Gesamt</TableCell>
            <TableCell className="text-center">{totals.total}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={avgTotalProgress} className="h-2 flex-1" />
                <span className="text-sm w-12 text-right">
                  {avgTotalProgress}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center text-green-600">{totals.onTrack}</TableCell>
            <TableCell className="text-center text-amber-600">{totals.atRisk}</TableCell>
            <TableCell className="text-center text-red-600">{totals.delayed}</TableCell>
            <TableCell className="text-center text-blue-600">{totals.completed}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
