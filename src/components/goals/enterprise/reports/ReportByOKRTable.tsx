import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Target } from "lucide-react";

export const ReportByOKRTable = () => {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals-for-okr-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('goal_type', 'okr')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: keyResults = [] } = useQuery({
    queryKey: ['key-results-for-okr-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_key_results')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const okrsWithKeyResults = goals.map(goal => {
    const goalKeyResults = keyResults.filter(kr => kr.goal_id === goal.id);
    const totalKRs = goalKeyResults.length;
    const avgProgress = totalKRs > 0
      ? Math.round(goalKeyResults.reduce((sum, kr) => sum + (kr.current_value || 0) / (kr.target_value || 1) * 100, 0) / totalKRs)
      : 0;
    const completedKRs = goalKeyResults.filter(kr => 
      kr.current_value && kr.target_value && kr.current_value >= kr.target_value
    ).length;

    return {
      ...goal,
      totalKRs,
      avgProgress,
      completedKRs
    };
  });

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      company: 'Unternehmen',
      department: 'Bereich',
      team: 'Team',
      individual: 'Individuell'
    };
    return labels[level] || level;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'on_track':
        return { label: 'Im Plan', className: 'bg-green-100 text-green-700 border-green-200' };
      case 'at_risk':
        return { label: 'Risiko', className: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'delayed':
      case 'behind':
        return { label: 'Verzögert', className: 'bg-red-100 text-red-700 border-red-200' };
      case 'completed':
        return { label: 'Abgeschlossen', className: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'Entwurf', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  if (okrsWithKeyResults.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Keine OKRs vorhanden</h3>
        <p className="text-muted-foreground">
          Erstellen Sie OKRs im Ziele-Modul, um den OKR-Fortschritt zu analysieren.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Objective</TableHead>
            <TableHead className="font-semibold">Ebene</TableHead>
            <TableHead className="font-semibold">Owner</TableHead>
            <TableHead className="text-center font-semibold">Key Results</TableHead>
            <TableHead className="font-semibold">Ø Fortschritt</TableHead>
            <TableHead className="text-center font-semibold">Erreicht</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {okrsWithKeyResults.map((okr) => {
            const statusBadge = getStatusBadge(okr.status);
            return (
              <TableRow key={okr.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {okr.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getLevelLabel(okr.level || '')}</Badge>
                </TableCell>
                <TableCell>{okr.owner_name || '-'}</TableCell>
                <TableCell className="text-center font-medium">
                  {okr.totalKRs}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={okr.avgProgress} className="h-2 w-20" />
                    <span className="text-sm">{okr.avgProgress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium text-green-600">{okr.completedKRs}</span>
                  <span className="text-muted-foreground">/{okr.totalKRs}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadge.className}>
                    {statusBadge.label}
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
