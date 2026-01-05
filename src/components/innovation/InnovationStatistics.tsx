
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Users, Award, Lightbulb } from 'lucide-react';
import { useInnovation } from '@/hooks/useInnovation';

export const InnovationStatistics = () => {
  const { statistics, isLoading } = useInnovation();

  if (isLoading) {
    return <div className="p-6">Lade Statistiken...</div>;
  }

  if (!statistics) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Statistiken verfügbar</h3>
          <p className="text-muted-foreground">
            Statistiken werden generiert, sobald Innovationsdaten vorhanden sind.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusData = Object.entries(statistics.ideas_by_status || {}).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const channelData = statistics.ideas_by_channel || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const monthlyData = [
    { name: 'Jan', ideen: 0, projekte: 0 },
    { name: 'Feb', ideen: 0, projekte: 0 },
    { name: 'Mär', ideen: 0, projekte: 0 },
    { name: 'Apr', ideen: 0, projekte: 0 },
    { name: 'Mai', ideen: 0, projekte: 0 },
    { name: 'Jun', ideen: statistics.ideas_this_month || 0, projekte: statistics.active_pilot_projects || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gesamte Ideen
                </p>
                <p className="text-2xl font-bold">{statistics.total_ideas}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{statistics.ideas_this_month} diesen Monat
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Umgesetzte Ideen
                </p>
                <p className="text-2xl font-bold">{statistics.implemented_ideas}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((statistics.implemented_ideas / statistics.total_ideas) * 100).toFixed(1)}% Erfolgsrate
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktive Pilotprojekte
                </p>
                <p className="text-2xl font-bold">{statistics.active_pilot_projects}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  In Bearbeitung
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Beteiligungsrate
                </p>
                <p className="text-2xl font-bold">{statistics.participation_rate}%</p>
                <div className="mt-2">
                  <Progress value={statistics.participation_rate} className="h-2" />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Ideen nach Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Ideen nach Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ideas_count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Monatlicher Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ideen" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="projekte" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
