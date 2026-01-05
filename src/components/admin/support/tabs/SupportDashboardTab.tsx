import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Ticket, AlertCircle, Clock, CheckCircle, TrendingUp, Building2, MessageSquare, Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSupportTickets, useSupportTicketStats } from "@/hooks/useSupportTickets";
import { useMemo } from "react";

const SupportDashboardTab = () => {
  const { data: tickets, isLoading: loadingTickets } = useSupportTickets();
  const { data: stats, isLoading: loadingStats } = useSupportTicketStats();

  // Berechne Modul-Statistiken
  const moduleChartData = useMemo(() => {
    const moduleCounts: Record<string, number> = {};
    (tickets || []).forEach(t => {
      const mod = t.module || 'Sonstige';
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
    });
    return Object.entries(moduleCounts)
      .map(([name, count]) => ({ name, tickets: count }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 4);
  }, [tickets]);

  // Berechne Trend-Daten (letzte 7 Tage)
  const trendChartData = useMemo(() => {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const dayCounts: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      dayCounts[dayName] = 0;
    }

    (tickets || []).forEach(t => {
      const created = new Date(t.created_at);
      const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const dayName = days[created.getDay()];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      }
    });

    return Object.entries(dayCounts).map(([day, count]) => ({ day, tickets: count }));
  }, [tickets]);

  // Kritische Tickets
  const criticalTickets = useMemo(() => {
    return (tickets || [])
      .filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed')
      .slice(0, 3);
  }, [tickets]);

  if (loadingStats || loadingTickets) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Dashboard...</span>
      </div>
    );
  }

  const openTickets = stats?.openTickets || 0;
  const criticalCount = stats?.criticalTickets || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-1">KI-Summary</h3>
              <p className="text-sm text-gray-700">
                Aktuell gibt es <span className="font-semibold">{openTickets} offene Tickets</span>.
                {criticalCount > 0 && (
                  <> <span className="text-red-600 font-semibold">{criticalCount} kritische Tickets</span> erfordern Aufmerksamkeit.</>
                )}
                {criticalCount === 0 && " Keine kritischen Tickets vorhanden."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><Ticket className="w-4 h-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-bold">{openTickets}</p>
            <p className="text-xs text-gray-500">Offene Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600" /></div>
            </div>
            <p className="text-2xl font-bold">{criticalCount}</p>
            <p className="text-xs text-gray-500">Kritische Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg"><Clock className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-bold">{stats?.avgResponseTime || '0'} h</p>
            <p className="text-xs text-gray-500">Ø Antwortzeit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-bold">{stats?.avgResolutionTime || '0'} h</p>
            <p className="text-xs text-gray-500">Ø Lösungszeit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-4 h-4 text-primary" /></div>
            </div>
            <p className="text-2xl font-bold">{stats?.totalTickets || 0}</p>
            <p className="text-xs text-gray-500">Gesamt Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg"><Building2 className="w-4 h-4 text-orange-600" /></div>
            </div>
            <p className="text-2xl font-bold">{moduleChartData.length}</p>
            <p className="text-xs text-gray-500">Betroffene Module</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets nach Modul</CardTitle></CardHeader>
          <CardContent>
            {moduleChartData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keine Daten</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={moduleChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Ticket-Trend (7 Tage)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Kritische Tickets</CardTitle>
          <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">{criticalCount} Tickets</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalTickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Keine kritischen Tickets</p>
          ) : (
            criticalTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary">{ticket.ticket_number}</span>
                      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 text-xs">Kritisch</Badge>
                    </div>
                    <p className="text-sm text-gray-900">{ticket.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      {ticket.company_name}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDashboardTab;