
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

export const AbsenceStatisticsView = () => {
  const { statistics, isLoadingStatistics, getTypeLabel } = useAbsenceManagement();

  if (isLoadingStatistics) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Keine Statistiken verfügbar</h3>
          <p>Es konnten keine Abwesenheitsstatistiken gefunden werden.</p>
        </div>
      </Card>
    );
  }

  // Daten für das Kuchendiagramm vorbereiten
  const pieChartData = Object.entries(statistics.by_type).map(([type, value]) => ({
    name: getTypeLabel(type as any),
    value,
  })).filter(item => item.value > 0);

  // Farben für das Kuchendiagramm
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Anzahl der Anträge nach Status
  const requestCountData = [
    { name: 'Beantragt', value: statistics.pending_requests },
    { name: 'Genehmigt', value: statistics.approved_requests },
    { name: 'Abgelehnt', value: statistics.rejected_requests },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Gesamte Abwesenheitstage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.total_days}</div>
            <p className="text-xs text-muted-foreground mt-1">Genehmigte Tage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Offene Anträge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.pending_requests}</div>
            <p className="text-xs text-muted-foreground mt-1">Ausstehende Genehmigung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Genehmigungsrate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statistics.approved_requests + statistics.rejected_requests > 0
                ? Math.round((statistics.approved_requests / (statistics.approved_requests + statistics.rejected_requests)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Genehmigte vs. abgelehnte Anträge</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Abwesenheiten nach Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.by_month} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Tage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abwesenheiten nach Typ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col justify-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Tage`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Keine Daten für das Diagramm verfügbar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anträge nach Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={requestCountData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  name="Anzahl" 
                  fill="#8884d8"
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
