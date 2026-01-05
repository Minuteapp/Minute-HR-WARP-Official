import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, Mail, Phone, Users, Briefcase, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { organizationChartService } from "@/services/organizationChartService";

interface OrgChartCardProps {
  node: any;
}

export const OrgChartCard = ({ node }: OrgChartCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['unit-employees', node.id],
    queryFn: () => organizationChartService.getUnitEmployees(node.id),
    enabled: expanded,
  });

  const managerName = node.manager 
    ? `${node.manager.first_name} ${node.manager.last_name}`
    : 'Vakant';

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: 'Exzellent', variant: 'default' as const };
    if (score >= 75) return { label: 'Gut', variant: 'secondary' as const };
    return { label: 'Mittel', variant: 'outline' as const };
  };

  const performance = getPerformanceBadge(node.performance || 0);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(managerName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{managerName}</h3>
              <p className="text-sm text-muted-foreground">{node.manager?.position || node.name}</p>
              <p className="text-xs text-muted-foreground">{node.type}</p>
            </div>
            
            {node.manager_id === null && (
              <Badge variant="destructive">Vakant</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{node.employeeCount} Mitarbeiter</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{node.teamsCount} Teams</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Badge variant={performance.variant}>{performance.label}</Badge>
            </div>
          </div>

          {node.openPositions > 0 && (
            <Badge variant="outline" className="text-orange-600">
              {node.openPositions} offene Stelle{node.openPositions > 1 ? 'n' : ''}
            </Badge>
          )}

          {node.manager && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {node.manager.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{node.manager.email}</span>
                </div>
              )}
              {node.manager.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{node.manager.phone}</span>
                </div>
              )}
            </div>
          )}

          {node.employeeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  {node.employeeCount} Mitarbeiter ausblenden
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  {node.employeeCount} Mitarbeiter anzeigen
                </>
              )}
            </Button>
          )}

          {expanded && employees.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Name</th>
                      <th className="text-left py-2 px-2">Rolle</th>
                      <th className="text-left py-2 px-2">Kontakt</th>
                      <th className="text-left py-2 px-2">Eintritt</th>
                      <th className="text-left py-2 px-2">Performance</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{emp.name}</td>
                        <td className="py-2 px-2">{emp.role}</td>
                        <td className="py-2 px-2">{emp.contact}</td>
                        <td className="py-2 px-2">
                          {emp.startDate ? new Date(emp.startDate).toLocaleDateString('de-DE') : '-'}
                        </td>
                        <td className="py-2 px-2">
                          <Badge variant={emp.performance >= 85 ? 'default' : 'secondary'}>
                            {emp.performance}%
                          </Badge>
                        </td>
                        <td className="py-2 px-2">
                          <Badge variant={emp.status === 'active' ? 'default' : 'outline'}>
                            {emp.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
