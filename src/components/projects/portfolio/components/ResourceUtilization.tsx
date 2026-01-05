
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface ResourceUtilizationProps {
  projects: any[];
}

export const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({ projects }) => {
  const [timeframe, setTimeframe] = useState('thisMonth');
  const [department, setDepartment] = useState('all');
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['resource-utilization', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position, department')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  const getUtilizationColor = (load: number) => {
    if (load >= 100) return 'bg-red-500';
    if (load >= 85) return 'bg-orange-500';
    if (load >= 70) return 'bg-yellow-500';
    if (load >= 40) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getUtilizationStatus = (load: number) => {
    if (load >= 100) return { status: 'Überlastet', color: 'text-red-600', icon: AlertTriangle };
    if (load >= 85) return { status: 'Hoch ausgelastet', color: 'text-orange-600', icon: Clock };
    if (load >= 70) return { status: 'Normal ausgelastet', color: 'text-yellow-600', icon: Activity };
    if (load >= 40) return { status: 'Verfügbar', color: 'text-green-600', icon: CheckCircle2 };
    return { status: 'Wenig ausgelastet', color: 'text-blue-600', icon: TrendingUp };
  };

  const departments = [...new Set(employees.map((e: any) => e.department).filter(Boolean))];

  const filteredEmployees = department === 'all' 
    ? employees 
    : employees.filter((e: any) => e.department === department);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Ressourcen-Daten</h3>
          <p className="text-muted-foreground">
            Fügen Sie zuerst Mitarbeiter hinzu, um die Ressourcen-Auslastung zu sehen.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    totalResources: filteredEmployees.length,
    overloaded: 0,
    highUtilization: 0,
    available: filteredEmployees.length,
    avgUtilization: 0
  };

  return (
    <div className="space-y-6">
      {/* Filter und Steuerung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ressourcen-Auslastung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">Diese Woche</SelectItem>
                <SelectItem value="nextWeek">Nächste Woche</SelectItem>
                <SelectItem value="thisMonth">Dieser Monat</SelectItem>
                <SelectItem value="nextMonth">Nächster Monat</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Abteilung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Abteilungen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={String(dept)} value={String(dept)}>{String(dept)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalResources}</p>
              <p className="text-sm text-muted-foreground">Gesamt Ressourcen</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.overloaded}</p>
              <p className="text-sm text-muted-foreground">Überlastet</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.highUtilization}</p>
              <p className="text-sm text-muted-foreground">Hoch ausgelastet</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-muted-foreground">Verfügbar</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.avgUtilization}%</p>
              <p className="text-sm text-muted-foreground">Ø Auslastung</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ressourcen-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Mitarbeiter-Auslastung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee: any) => {
              const status = getUtilizationStatus(0);
              const StatusIcon = status.icon;
              
              return (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.position || 'Keine Position'} • {employee.department || 'Keine Abteilung'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.status}
                      </span>
                    </div>
                  </div>

                  {/* Auslastungsbalken */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Aktuelle Auslastung</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 relative overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getUtilizationColor(0)}`}
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
