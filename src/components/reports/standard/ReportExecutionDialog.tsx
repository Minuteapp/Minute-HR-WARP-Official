import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, Play, Calendar, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

interface ReportExecutionDialogProps {
  report: {
    id: string;
    title: string;
    category: string;
    frequency: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportExecutionDialog: React.FC<ReportExecutionDialogProps> = ({ 
  report, 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [period, setPeriod] = useState('current-month');
  const [isExecuted, setIsExecuted] = useState(false);

  // Fetch report data based on report type
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report-execution', report.id, companyId, period],
    queryFn: async () => {
      if (!companyId) return null;
      
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'last-month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;
        case 'last-quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'last-year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Fetch data based on report type
      if (report.id === 'employee-headcount') {
        const { count: activeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'active');
        
        const { count: newHires } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .gte('hire_date', startDateStr);
        
        const { count: terminations } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'inactive')
          .gte('termination_date', startDateStr);
        
        const { data: deptData } = await supabase
          .from('employees')
          .select('department')
          .eq('company_id', companyId)
          .eq('status', 'active');
        
        // Group by department
        const deptCounts: Record<string, number> = {};
        deptData?.forEach(emp => {
          const dept = emp.department || 'Sonstige';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        const colors = ['#4F46E5', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];
        const departmentChart = Object.entries(deptCounts).map(([name, value], i) => ({
          name,
          value,
          color: colors[i % colors.length]
        }));

        return {
          kpis: [
            { label: 'Aktive Mitarbeiter', value: activeCount || 0, trend: 'neutral' },
            { label: 'Neueinstellungen', value: newHires || 0, trend: 'up' },
            { label: 'Abgänge', value: terminations || 0, trend: 'down' },
            { label: 'Fluktuationsrate', value: activeCount ? `${Math.round(((terminations || 0) / activeCount) * 100)}%` : '0%', trend: 'neutral' },
          ],
          departmentChart,
        };
      }
      
      if (report.id === 'sick-leave-analysis') {
        const { count: sickCount } = await supabase
          .from('sick_leaves')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .gte('start_date', startDateStr);
        
        const { count: activeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'active');
        
        const rate = activeCount ? Math.round(((sickCount || 0) / activeCount) * 100 * 10) / 10 : 0;
        
        return {
          kpis: [
            { label: 'Krankmeldungen', value: sickCount || 0, trend: 'neutral' },
            { label: 'Krankenstandsquote', value: `${rate}%`, trend: rate > 5 ? 'down' : 'up' },
            { label: 'Mitarbeiter gesamt', value: activeCount || 0, trend: 'neutral' },
          ],
          departmentChart: [],
        };
      }

      if (report.id === 'absence-overview') {
        const { count: vacationCount } = await supabase
          .from('absence_requests')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('type', 'vacation')
          .gte('start_date', startDateStr);
        
        const { count: sickCount } = await supabase
          .from('sick_leaves')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .gte('start_date', startDateStr);
        
        const { count: otherCount } = await supabase
          .from('absence_requests')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .neq('type', 'vacation')
          .gte('start_date', startDateStr);

        return {
          kpis: [
            { label: 'Urlaubsanträge', value: vacationCount || 0, trend: 'neutral' },
            { label: 'Krankmeldungen', value: sickCount || 0, trend: 'neutral' },
            { label: 'Sonstige Abwesenheiten', value: otherCount || 0, trend: 'neutral' },
            { label: 'Gesamt', value: (vacationCount || 0) + (sickCount || 0) + (otherCount || 0), trend: 'neutral' },
          ],
          departmentChart: [
            { name: 'Urlaub', value: vacationCount || 0, color: '#10B981' },
            { name: 'Krankheit', value: sickCount || 0, color: '#EF4444' },
            { name: 'Sonstiges', value: otherCount || 0, color: '#9CA3AF' },
          ],
        };
      }

      // Default empty data for other reports
      return {
        kpis: [],
        departmentChart: [],
      };
    },
    enabled: !!companyId && isExecuted,
  });

  const handleExecute = () => {
    setIsExecuted(true);
    refetch();
  };

  const periodLabel = {
    'current-month': 'Aktueller Monat',
    'last-month': 'Letzter Monat',
    'last-quarter': 'Letztes Quartal',
    'last-year': 'Letztes Jahr',
  }[period] || period;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{report.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{report.category}</Badge>
                <Badge variant="outline">{report.frequency}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Aktueller Monat</SelectItem>
                <SelectItem value="last-month">Letzter Monat</SelectItem>
                <SelectItem value="last-quarter">Letztes Quartal</SelectItem>
                <SelectItem value="last-year">Letztes Jahr</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleExecute}>
              <Play className="h-4 w-4 mr-2" />
              Bericht ausführen
            </Button>

            <div className="ml-auto flex gap-2">
              <Button variant="outline" disabled={!isExecuted}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" disabled={!isExecuted}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isExecuted ? (
            <Card className="bg-muted/50">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Bericht noch nicht ausgeführt</h3>
                <p className="text-muted-foreground mb-4">
                  Wählen Sie einen Zeitraum und klicken Sie auf "Bericht ausführen", um die Analyse zu starten.
                </p>
                <Button onClick={handleExecute}>
                  <Play className="h-4 w-4 mr-2" />
                  Jetzt ausführen
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-64" />
            </div>
          ) : reportData ? (
            <>
              {/* KPI Cards */}
              {reportData.kpis.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.kpis.map((kpi, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">{kpi.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-bold">{kpi.value}</span>
                          {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Chart */}
              {reportData.departmentChart && reportData.departmentChart.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-4">Verteilung</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={reportData.departmentChart}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.departmentChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Automatische Erkenntnisse</h4>
                  <p className="text-sm text-blue-800">
                    Zeitraum: {periodLabel}. 
                    {reportData.kpis.length > 0 && ` ${reportData.kpis.length} Kennzahlen wurden analysiert.`}
                    {reportData.departmentChart.length > 0 && ` Verteilung über ${reportData.departmentChart.length} Kategorien.`}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
                <p className="text-muted-foreground">
                  Für diesen Zeitraum sind keine Daten vorhanden.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportExecutionDialog;
