import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Mail, MapPin, UserCheck } from "lucide-react";
import { useEmployeeData } from "@/hooks/useEmployeeData";

interface EmployeeOverviewHeaderProps {
  employeeId: string;
}

const getEmploymentTypeLabel = (type?: string) => {
  switch (type) {
    case 'full_time':
      return 'Vollzeit';
    case 'part_time':
      return 'Teilzeit';
    case 'temporary':
      return 'Befristet';
    case 'freelance':
      return 'Freiberuflich';
    case 'intern':
      return 'Praktikant';
    default:
      return 'Nicht angegeben';
  }
};

export const EmployeeOverviewHeader: React.FC<EmployeeOverviewHeaderProps> = ({ employeeId }) => {
  const { employee, isLoading } = useEmployeeData(employeeId);

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar className="h-20 w-20 border-4 border-primary/10">
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {employee.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{employee.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={employee.status === 'active' ? 'success' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-3 w-3" />
                    {employee.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  <Badge variant="outline">{getEmploymentTypeLabel(employee.employment_type)}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-semibold">{employee.position || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Abteilung</p>
                  <p className="font-semibold">{employee.department || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <p className="font-semibold text-sm">{(employee as any).email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Standort</p>
                  <p className="font-semibold">Hauptstandort</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeOverviewHeader;
