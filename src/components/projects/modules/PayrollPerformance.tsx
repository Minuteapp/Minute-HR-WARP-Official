
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Award, 
  Target,
  DollarSign,
  Star,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface PayrollPerformanceProps {
  projectId: string;
  projectName: string;
}

export const PayrollPerformance: React.FC<PayrollPerformanceProps> = ({
  projectId,
  projectName
}) => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['project-performance-bonuses', companyId, projectId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .eq('company_id', companyId)
        .limit(10);
      return data || [];
    },
    enabled: !!companyId
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'calculated':
        return <Badge className="bg-green-100 text-green-800">Berechnet</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Genehmigt</Badge>;
      default:
        return <Badge variant="outline">Ausstehend</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Performance-Daten</h3>
          <p className="text-muted-foreground">
            Für dieses Projekt wurden noch keine Performance-Boni konfiguriert.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance-KPIs Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projekt-Completion</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ziel: 100%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualität</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ziel: 90%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Teamwork</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ziel: 85%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Innovation</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Ziel: 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Bonus-Berechnung Formel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bonus-Berechnungsformel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-3">Performance-Bonus = Basis-Bonus × Performance-Multiplikator × KPI-Erfüllung</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Basis-Bonus</p>
                <p className="text-xl font-bold">€0</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Performance-Multiplikator</p>
                <p className="text-xl font-bold">1.0x</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Ø KPI-Erfüllung</p>
                <p className="text-xl font-bold">0%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mitarbeiter Performance-Boni */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Performance-Bonus Berechnung</CardTitle>
            <Button>
              <Calculator className="h-4 w-4 mr-2" />
              Alle berechnen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee: any) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.position || 'Keine Position'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">€0.00</p>
                  {getStatusBadge('pending')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance-Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance-Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Durchschnittliche Team-Performance</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Keine Daten</span>
              </div>
            </div>
            <Progress value={0} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Bonus-Auszahlungen</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">€0 total</span>
              </div>
            </div>
            <Progress value={0} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
