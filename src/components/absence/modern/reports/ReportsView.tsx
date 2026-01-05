import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, Calendar, Activity, Users, Sparkles } from 'lucide-react';
import { MonthlyAbsenceChart } from './MonthlyAbsenceChart';
import { AbsenceDistributionChart } from './AbsenceDistributionChart';
import { DepartmentComparisonTable } from './DepartmentComparisonTable';
import { TrendForecastChart } from './TrendForecastChart';
import { AbsenceAIPanel } from '../AbsenceAIPanel';
import { absenceReportsService } from '@/services/absenceReportsService';
import { absenceExportService } from '@/services/absenceExportService';
import { absenceService } from '@/services/absenceService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
export const ReportsView = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Lade Statistiken aus der Datenbank
  const { data: stats, isLoading } = useQuery({
    queryKey: ['yearly-statistics', selectedYear],
    queryFn: () => absenceReportsService.getYearlyStatistics(parseInt(selectedYear))
  });

  // Lade Abteilungen aus DB
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('department')
        .eq('status', 'active')
        .not('department', 'is', null);
      return [...new Set(data?.map(e => e.department).filter(Boolean))];
    }
  });

  const statsCards = [
    {
      title: 'Durchschn. Abwesenheitsrate',
      value: isLoading ? '...' : `${stats?.absenceRate || '0'}%`,
      change: '+0.5% vs. Vorjahr',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: 'up'
    },
    {
      title: 'Durchschn. Urlaubstage',
      value: isLoading ? '...' : `${stats?.avgVacationDays || '0'} Tage`,
      change: '+1.2 vs. Vorjahr',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up'
    },
    {
      title: 'Durchschn. Krankheitstage',
      value: isLoading ? '...' : `${stats?.avgSickDays || '0'} Tage`,
      change: '-0.8 vs. Vorjahr',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'down'
    },
    {
      title: 'Resturlaub gesamt',
      value: isLoading ? '...' : `${stats?.totalRemainingVacation || '0'} Tage`,
      subtitle: 'Alle Mitarbeiter',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  // Lade Daten für Export
  const { data: allRequests = [] } = useQuery({
    queryKey: ['absence-requests-for-export', selectedYear],
    queryFn: () => absenceService.getRequests()
  });

  const handleExport = () => {
    // Filtere nach Jahr
    const yearRequests = allRequests.filter((r: any) => 
      new Date(r.start_date).getFullYear().toString() === selectedYear
    );

    if (yearRequests.length === 0) {
      toast({
        title: 'Keine Daten',
        description: `Keine Abwesenheiten für ${selectedYear} gefunden.`,
        variant: 'destructive'
      });
      return;
    }

    absenceExportService.exportToPdf(yearRequests, `abwesenheitsbericht_${selectedYear}`, `Abwesenheitsbericht ${selectedYear}`);
    toast({
      title: 'Export erfolgreich',
      description: 'Der Bericht wurde als PDF exportiert.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Berichte & Analyse</h2>
          <p className="text-muted-foreground">Abwesenheitsstatistiken und KPI-Auswertungen</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
              <SelectItem value="all-employees">Alle Mitarbeiter</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export (PDF/Excel)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-xs ${stat.trend === 'down' ? 'text-green-600' : 'text-orange-600'}`}>
                      {stat.change}
                    </p>
                  )}
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Monatliche Abwesenheiten {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyAbsenceChart year={selectedYear} department={selectedDepartment} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Verteilung nach Art
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AbsenceDistributionChart year={selectedYear} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Abteilungsvergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentComparisonTable year={selectedYear} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              KI-Prognose: Urlaubstrends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendForecastChart />
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              KI-Insights & Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AbsenceAIPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
