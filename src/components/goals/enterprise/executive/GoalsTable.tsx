import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GoalsTableRow } from "./GoalsTableRow";

interface Goal {
  id: string;
  title: string;
  goal_level: string;
  owner_name?: string;
  status: string;
  progress: number;
  trend: string;
  risk_level: string;
}

interface GoalsTableProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}

export const GoalsTable = ({ goals, onGoalClick }: GoalsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alle Ziele ({goals.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Keine Ziele vorhanden. Erstellen Sie Ihr erstes Ziel, um zu beginnen.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ziel</TableHead>
                <TableHead>Ebene</TableHead>
                <TableHead>Verantwortlich</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fortschritt</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Risiko</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <GoalsTableRow 
                  key={goal.id} 
                  goal={goal} 
                  onClick={onGoalClick}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
