
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DepartmentWorkload {
  id: string;
  name: string;
  totalHours: number;
  targetHours: number;
  employeeCount: number;
  averageHoursPerEmployee: number;
  variance: number;
  status: 'balanced' | 'overloaded' | 'underloaded';
}

interface EmployeeWorkload {
  id: string;
  name: string;
  department: string;
  currentHours: number;
  targetHours: number;
  utilization: number;
  shifts: string[];
}

const WorkloadBalancer: React.FC = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentWorkload[]>([
    {
      id: 'dept-1',
      name: 'Verkauf',
      totalHours: 280,
      targetHours: 240,
      employeeCount: 4,
      averageHoursPerEmployee: 70,
      variance: 15,
      status: 'overloaded'
    },
    {
      id: 'dept-2',
      name: 'Lager',
      totalHours: 200,
      targetHours: 240,
      employeeCount: 3,
      averageHoursPerEmployee: 67,
      variance: -15,
      status: 'underloaded'
    },
    {
      id: 'dept-3',
      name: 'Sicherheit',
      totalHours: 168,
      targetHours: 168,
      employeeCount: 2,
      averageHoursPerEmployee: 84,
      variance: 0,
      status: 'balanced'
    }
  ]);

  const [employeeData, setEmployeeData] = useState<EmployeeWorkload[]>([
    {
      id: 'emp-001',
      name: 'Anna Müller',
      department: 'Verkauf',
      currentHours: 45,
      targetHours: 40,
      utilization: 112,
      shifts: ['Mo Früh', 'Di Früh', 'Mi Früh', 'Do Spät', 'Fr Spät']
    },
    {
      id: 'emp-003',
      name: 'Maria Schmidt',
      department: 'Verkauf',
      currentHours: 42,
      targetHours: 40,
      utilization: 105,
      shifts: ['Mo Spät', 'Di Spät', 'Mi Spät', 'Do Früh', 'Fr Früh']
    },
    {
      id: 'emp-002',
      name: 'Thomas Weber',
      department: 'Lager',
      currentHours: 35,
      targetHours: 40,
      utilization: 87,
      shifts: ['Mo Nacht', 'Di Nacht', 'Mi Spät', 'Do Spät']
    },
    {
      id: 'emp-004',
      name: 'Jan Becker',
      department: 'Lager',
      currentHours: 38,
      targetHours: 40,
      utilization: 95,
      shifts: ['Mo Spät', 'Di Spät', 'Mi Nacht', 'Do Nacht', 'Fr Spät']
    }
  ]);

  const { toast } = useToast();

  const balanceWorkload = async () => {
    toast({
      title: "Arbeitsbelastung wird ausgeglichen",
      description: "Automatische Neuverteilung der Schichten..."
    });

    // Simuliere Neuverteilung
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update department data to balanced
    setDepartmentData(prev => prev.map(dept => ({
      ...dept,
      totalHours: dept.targetHours,
      variance: 0,
      status: 'balanced' as const,
      averageHoursPerEmployee: dept.targetHours / dept.employeeCount
    })));

    // Update employee data
    setEmployeeData(prev => prev.map(emp => ({
      ...emp,
      currentHours: emp.targetHours,
      utilization: 100
    })));

    toast({
      title: "Arbeitsbelastung ausgeglichen",
      description: "Alle Abteilungen sind jetzt optimal ausgelastet."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'balanced': return 'bg-green-100 text-green-800';
      case 'overloaded': return 'bg-red-100 text-red-800';
      case 'underloaded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90 && utilization <= 110) return 'text-green-600';
    if (utilization > 110) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 10) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (variance < -10) return <TrendingUp className="h-4 w-4 text-yellow-600 rotate-180" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Arbeitsbelastungs-Balance</h3>
          <p className="text-gray-600">Automatische Verteilung für optimale Auslastung</p>
        </div>
        <Button onClick={balanceWorkload}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Automatisch ausgleichen
        </Button>
      </div>

      {/* Overall Balance Status */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Unausgewogene Arbeitsverteilung erkannt:</strong> Verkaufsteam ist um 15% überlastet, 
          während das Lagerteam um 15% unterausgelastet ist.
        </AlertDescription>
      </Alert>

      {/* Department Overview */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Abteilungs-Übersicht
            </CardTitle>
            <CardDescription>
              Arbeitsbelastung nach Abteilungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {dept.name}
                        {getVarianceIcon(dept.variance)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {dept.employeeCount} Mitarbeiter • Ø {dept.averageHoursPerEmployee}h pro Person
                      </p>
                    </div>
                    <Badge className={getStatusColor(dept.status)}>
                      {dept.status === 'balanced' ? 'Ausgewogen' :
                       dept.status === 'overloaded' ? 'Überlastet' : 'Unterausgelastet'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Arbeitszeit</span>
                      <span>{dept.totalHours}h / {dept.targetHours}h</span>
                    </div>
                    <Progress 
                      value={(dept.totalHours / dept.targetHours) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Abweichung: {dept.variance > 0 ? '+' : ''}{dept.variance}%</span>
                      <span>{Math.round((dept.totalHours / dept.targetHours) * 100)}% Auslastung</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Detail View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mitarbeiter-Details
            </CardTitle>
            <CardDescription>
              Individuelle Arbeitsbelastung pro Mitarbeiter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeData.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{employee.name}</h4>
                      <p className="text-sm text-gray-600">{employee.department}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getUtilizationColor(employee.utilization)}`}>
                        {employee.utilization}%
                      </div>
                      <div className="text-xs text-gray-500">Auslastung</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Arbeitszeit</span>
                      <span>{employee.currentHours}h / {employee.targetHours}h</span>
                    </div>
                    <Progress 
                      value={(employee.currentHours / employee.targetHours) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Aktuelle Schichten:</p>
                    <div className="flex flex-wrap gap-1">
                      {employee.shifts.map((shift, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {shift}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Balance Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Ausgleichs-Vorschläge</CardTitle>
            <CardDescription>
              Intelligente Empfehlungen für bessere Balance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Schichten verlagern</h4>
                <p className="text-sm text-blue-700">
                  2 Frühschichten von Verkauf zu Lager verlagern würde die Balance um 8% verbessern.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Überstunden reduzieren</h4>
                <p className="text-sm text-green-700">
                  Anna Müller auf 40h reduzieren und Thomas Weber auf 40h erhöhen.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Flexibilität erhöhen</h4>
                <p className="text-sm text-purple-700">
                  Abteilungsübergreifende Schichten für bessere Flexibilität einführen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkloadBalancer;
