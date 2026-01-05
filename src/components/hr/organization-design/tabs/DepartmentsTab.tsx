import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Info } from "lucide-react";
import { departmentsService, DepartmentFilters } from "@/services/departmentsService";
import { DepartmentFilters as FilterComponent } from "../components/DepartmentFilters";

export const DepartmentsTab = () => {
  const [filters, setFilters] = useState<DepartmentFilters>({});

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments-with-metrics', filters],
    queryFn: () => departmentsService.getDepartmentsWithMetrics(filters),
  });

  const getTurnoverColor = (rate: number) => {
    if (rate < 5) return 'bg-green-100 text-green-800';
    if (rate < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getUtilizationColor = (util: number) => {
    if (util < 70) return 'bg-blue-100 text-blue-800';
    if (util < 90) return 'bg-green-100 text-green-800';
    return 'bg-orange-100 text-orange-800';
  };

  const handleExport = () => {
    const csv = [
      ['Abteilung', 'Leiter', 'Standort', 'Mitarbeiter', 'Budget', 'Projekte', 'Offen', 'Fluktuation', 'Zufriedenheit', 'Zielstatus', 'Auslastung'],
      ...departments.map(d => [
        d.name,
        d.manager,
        d.location,
        d.employeeCount,
        d.budget,
        d.projects,
        d.openPositions,
        `${d.turnover}%`,
        `${d.satisfaction}/10`,
        `${d.targetStatus}%`,
        `${d.utilization}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abteilungen.csv';
    a.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Lädt Abteilungen...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Performance-Modus: Zeigt detaillierte Metriken für alle {departments.length} Abteilungen
        </AlertDescription>
      </Alert>

      <div className="flex gap-6">
        <FilterComponent onFiltersChange={setFilters} />

        <div className="flex-1 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportieren
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Abteilung</th>
                    <th className="text-left py-3 px-4 font-medium">Leiter</th>
                    <th className="text-left py-3 px-4 font-medium">Standort</th>
                    <th className="text-right py-3 px-4 font-medium">Mitarbeiter</th>
                    <th className="text-right py-3 px-4 font-medium">Budget</th>
                    <th className="text-right py-3 px-4 font-medium">Projekte</th>
                    <th className="text-right py-3 px-4 font-medium">Offen</th>
                    <th className="text-right py-3 px-4 font-medium">Fluktuation</th>
                    <th className="text-right py-3 px-4 font-medium">Zufriedenheit</th>
                    <th className="text-right py-3 px-4 font-medium">Zielstatus</th>
                    <th className="text-right py-3 px-4 font-medium">Auslastung</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4">{dept.manager}</td>
                      <td className="py-3 px-4">{dept.location}</td>
                      <td className="text-right py-3 px-4">{dept.employeeCount}</td>
                      <td className="text-right py-3 px-4">
                        €{dept.budget.toLocaleString('de-DE')}
                      </td>
                      <td className="text-right py-3 px-4">{dept.projects}</td>
                      <td className="text-right py-3 px-4">
                        {dept.openPositions > 0 ? (
                          <Badge variant="outline" className="text-orange-600">
                            {dept.openPositions}
                          </Badge>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className={getTurnoverColor(dept.turnover)}>
                          {dept.turnover.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">{dept.satisfaction.toFixed(1)}/10</td>
                      <td className="text-right py-3 px-4">{dept.targetStatus}%</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant="secondary" className={getUtilizationColor(dept.utilization)}>
                          {dept.utilization}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            Zeige {departments.length} von {departments.length} Abteilungen
          </div>
        </div>
      </div>
    </div>
  );
};
