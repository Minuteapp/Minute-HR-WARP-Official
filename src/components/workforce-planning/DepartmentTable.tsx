import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Department, WorkforceAnalytics } from "@/hooks/useWorkforceData";

interface DepartmentTableProps {
  departments: Department[];
  analytics: WorkforceAnalytics[];
}

export const DepartmentTable = ({ departments, analytics }: DepartmentTableProps) => {
  const getDepartmentAnalytics = (departmentId: string) => {
    return analytics.find(a => a.department_id === departmentId);
  };

  const getTurnoverColor = (rate: number) => {
    if (rate < 5) return "bg-green-100 text-green-800";
    if (rate < 15) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (departments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Abteilungen gefunden</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Abteilung</TableHead>
          <TableHead className="text-right">Mitarbeiter</TableHead>
          <TableHead className="text-right">Fluktuation</TableHead>
          <TableHead className="text-right">Zufriedenheit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((dept) => {
          const analytics_data = getDepartmentAnalytics(dept.id);
          return (
            <TableRow key={dept.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{dept.name}</div>
                  {dept.description && (
                    <div className="text-sm text-muted-foreground">{dept.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-semibold">{analytics_data?.total_employees || 0}</div>
                <div className="text-sm text-muted-foreground">
                  +{analytics_data?.new_hires || 0} neu
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant="secondary" 
                  className={getTurnoverColor(analytics_data?.turnover_rate || 0)}
                >
                  {analytics_data?.turnover_rate?.toFixed(1) || 0}%
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-semibold">
                  {analytics_data?.satisfaction_score?.toFixed(1) || 0}/10
                </div>
                <div className="text-sm text-muted-foreground">
                  Produktivität: {analytics_data?.productivity_score?.toFixed(1) || 0}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};