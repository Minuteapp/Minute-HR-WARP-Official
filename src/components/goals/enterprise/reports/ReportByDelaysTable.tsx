import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";

export const ReportByDelaysTable = () => {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals-for-delays-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .or('status.eq.delayed,status.eq.behind,status.eq.at_risk')
        .order('target_date', { ascending: true });
      if (error) throw error;
      return data || [];
    }
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

  const getDelayDays = (targetDate: string | null) => {
    if (!targetDate) return 0;
    const today = new Date();
    const target = new Date(targetDate);
    return differenceInDays(today, target);
  };

  if (goals.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Keine verzögerten Ziele</h3>
        <p className="text-muted-foreground">
          Aktuell gibt es keine Ziele mit Verzögerungen oder Risiken.
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
            <TableHead className="font-semibold">Owner</TableHead>
            <TableHead className="font-semibold">Fortschritt</TableHead>
            <TableHead className="font-semibold">Fälligkeitsdatum</TableHead>
            <TableHead className="font-semibold text-red-600">Verzögerung</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => {
            const delayDays = getDelayDays(goal.target_date);
            return (
              <TableRow key={goal.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {goal.title}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getLevelLabel(goal.level || '')}</Badge>
                </TableCell>
                <TableCell>{goal.owner_name || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={goal.progress || 0} className="h-2 w-20" />
                    <span className="text-sm">{goal.progress || 0}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {goal.target_date 
                    ? format(new Date(goal.target_date), 'dd.MM.yyyy', { locale: de })
                    : '-'}
                </TableCell>
                <TableCell className="text-red-600 font-medium">
                  {delayDays > 0 ? `+${delayDays} Tage` : '-'}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={
                      goal.status === 'delayed' || goal.status === 'behind'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }
                  >
                    {goal.status === 'delayed' || goal.status === 'behind' ? 'Verzögert' : 'Risiko'}
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
