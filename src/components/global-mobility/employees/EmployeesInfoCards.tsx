
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ShieldCheck } from 'lucide-react';

interface EmployeesInfoCardsProps {
  employmentModels: { model: string; count: number }[];
  familyStats: { withFamily: number; withoutFamily: number };
  dataIntegrity: number;
}

export function EmployeesInfoCards({ employmentModels, familyStats, dataIntegrity }: EmployeesInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Beschäftigungsmodelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employmentModels.length > 0 ? (
            <div className="space-y-2">
              {employmentModels.map((item) => (
                <div key={item.model} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.model}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Daten</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Familienstatus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mit Familie</span>
              <span className="font-medium">{familyStats.withFamily}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ohne Familie</span>
              <span className="font-medium">{familyStats.withoutFamily}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Datenintegrität
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{dataIntegrity}%</span>
            <span className="text-sm text-muted-foreground pb-1">vollständig</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
