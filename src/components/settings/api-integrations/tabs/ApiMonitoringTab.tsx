import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ApiUsageLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  error_message: string;
  created_at: string;
}

export function ApiMonitoringTab() {
  const [timeRange, setTimeRange] = useState('24h');

  const { data: usageLogs, isLoading } = useQuery({
    queryKey: ['api-usage-logs', timeRange],
    queryFn: async () => {
      const hoursAgo = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      return data as ApiUsageLog[];
    }
  });

  const { data: integrations } = useQuery({
    queryKey: ['external-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate metrics
  const totalRequests = usageLogs?.length || 0;
  const successfulRequests = usageLogs?.filter(l => l.status_code >= 200 && l.status_code < 300).length || 0;
  const failedRequests = usageLogs?.filter(l => l.status_code >= 400).length || 0;
  const avgResponseTime = usageLogs?.length 
    ? usageLogs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / usageLogs.length 
    : 0;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;

  // Group by hour for chart
  const hourlyData = usageLogs?.reduce((acc, log) => {
    const hour = new Date(log.created_at).toLocaleString('de', { hour: '2-digit', minute: '2-digit' });
    if (!acc[hour]) {
      acc[hour] = { hour, requests: 0, errors: 0, avgTime: 0, times: [] };
    }
    acc[hour].requests++;
    if (log.status_code >= 400) acc[hour].errors++;
    acc[hour].times.push(log.response_time_ms || 0);
    return acc;
  }, {} as Record<string, any>) || {};

  const chartData = Object.values(hourlyData).map((d: any) => ({
    ...d,
    avgTime: d.times.reduce((a: number, b: number) => a + b, 0) / d.times.length
  })).slice(-12);

  // Endpoints breakdown
  const endpointStats = usageLogs?.reduce((acc, log) => {
    const endpoint = log.endpoint || 'unknown';
    if (!acc[endpoint]) {
      acc[endpoint] = { endpoint, count: 0, errors: 0 };
    }
    acc[endpoint].count++;
    if (log.status_code >= 400) acc[endpoint].errors++;
    return acc;
  }, {} as Record<string, any>) || {};

  const topEndpoints = Object.values(endpointStats)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          API Monitoring
        </h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Stunden</SelectItem>
            <SelectItem value="7d">7 Tage</SelectItem>
            <SelectItem value="30d">30 Tage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anfragen gesamt</p>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfolgsrate</p>
                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
              </div>
              <div className={`p-2 rounded-lg ${successRate >= 99 ? 'bg-green-100 dark:bg-green-900' : successRate >= 95 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {successRate >= 99 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Antwortzeit</p>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <div className={`p-2 rounded-lg ${avgResponseTime < 200 ? 'bg-green-100 dark:bg-green-900' : avgResponseTime < 500 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fehler</p>
                <p className="text-2xl font-bold">{failedRequests}</p>
              </div>
              <div className={`p-2 rounded-lg ${failedRequests === 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <AlertCircle className={`h-5 w-5 ${failedRequests === 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Anfragen über Zeit</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="requests" fill="hsl(var(--primary))" name="Anfragen" />
                  <Bar dataKey="errors" fill="hsl(var(--destructive))" name="Fehler" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Antwortzeiten</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Ø Zeit (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints & Integration Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            {topEndpoints.length > 0 ? (
              <div className="space-y-3">
                {topEndpoints.map((ep: any) => (
                  <div key={ep.endpoint} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {ep.endpoint}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{ep.count}</span>
                      {ep.errors > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {ep.errors} Fehler
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Keine Endpoint-Daten</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            {integrations && integrations.length > 0 ? (
              <div className="space-y-3">
                {integrations.slice(0, 5).map((integration: any) => (
                  <div key={integration.id} className="flex items-center justify-between">
                    <span className="text-sm">{integration.display_name}</span>
                    <Badge 
                      variant={integration.status === 'active' ? 'default' : integration.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {integration.status === 'active' ? 'Aktiv' : integration.status === 'error' ? 'Fehler' : 'Inaktiv'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Keine Integrationen konfiguriert</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      {failedRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Letzte Fehler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usageLogs
                ?.filter(l => l.status_code >= 400)
                .slice(0, 5)
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{log.status_code}</Badge>
                      <code className="text-xs">{log.endpoint}</code>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('de')}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
