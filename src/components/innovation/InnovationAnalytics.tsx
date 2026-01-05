import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Lightbulb, CheckCircle, Clock, Target, Loader2 } from "lucide-react";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#8dd1e1'];

const InnovationAnalytics = () => {
  // Lade Ideen aus der Datenbank
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Berechne monatliche Daten
  const monthlyData = (() => {
    const monthly: Record<string, { ideas: number; implemented: number; participants: Set<string> }> = {};
    
    ideas.forEach(idea => {
      if (idea.created_at) {
        const month = new Date(idea.created_at).toLocaleDateString('de-DE', { month: 'short' });
        if (!monthly[month]) {
          monthly[month] = { ideas: 0, implemented: 0, participants: new Set() };
        }
        monthly[month].ideas++;
        if (['implementation', 'scaled'].includes(idea.status)) {
          monthly[month].implemented++;
        }
        if (idea.submitted_by_name) {
          monthly[month].participants.add(idea.submitted_by_name);
        }
      }
    });
    
    return Object.entries(monthly).slice(-6).map(([month, data]) => ({
      month,
      ideas: data.ideas,
      implemented: data.implemented,
      participants: data.participants.size,
    }));
  })();

  // Berechne Kategorien-Daten
  const categoryData = (() => {
    const categories: Record<string, number> = {};
    ideas.forEach(idea => {
      const cat = idea.category || 'Sonstiges';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  })();

  // Status-Verteilung
  const implementationData = (() => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'new': { label: 'Eingereicht', color: '#94a3b8' },
      'in_review': { label: 'In Bewertung', color: '#fbbf24' },
      'evaluation': { label: 'In Bewertung', color: '#fbbf24' },
      'experiment': { label: 'Experiment', color: '#a78bfa' },
      'implementation': { label: 'In Entwicklung', color: '#60a5fa' },
      'scaled': { label: 'Implementiert', color: '#34d399' },
      'rejected': { label: 'Abgelehnt', color: '#f87171' },
    };
    
    const counts: Record<string, number> = {};
    ideas.forEach(idea => {
      counts[idea.status] = (counts[idea.status] || 0) + 1;
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      status: statusMap[status]?.label || status,
      count,
      color: statusMap[status]?.color || '#94a3b8',
    }));
  })();

  // Impact Metriken
  const totalIdeas = ideas.length;
  const implementedIdeas = ideas.filter(i => ['implementation', 'scaled'].includes(i.status)).length;
  const uniqueParticipants = new Set(ideas.map(i => i.submitted_by_name)).size;

  const impactMetrics = [
    { title: "Ideen gesamt", value: totalIdeas.toString(), description: "Eingereichte Ideen", icon: Lightbulb, trend: "" },
    { title: "Umgesetzt", value: implementedIdeas.toString(), description: "Erfolgreich implementiert", icon: CheckCircle, trend: "" },
    { title: "Teilnehmer", value: uniqueParticipants.toString(), description: "Einreicher", icon: Users, trend: "" },
    { title: "Umsetzungsrate", value: totalIdeas > 0 ? `${Math.round((implementedIdeas / totalIdeas) * 100)}%` : "0%", description: "Quote", icon: Target, trend: "" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <metric.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideen Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Ideen-Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ideas" stroke="#8884d8" strokeWidth={2} name="Eingereichte Ideen" />
                  <Line type="monotone" dataKey="implemented" stroke="#82ca9d" strokeWidth={2} name="Implementierte Ideen" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kategorie Verteilung */}
        <Card>
          <CardHeader>
            <CardTitle>Ideen nach Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Kategorien-Daten
              </div>
            )}
          </CardContent>
        </Card>

        {/* Umsetzungsstatus */}
        <Card>
          <CardHeader>
            <CardTitle>Umsetzungsstatus</CardTitle>
          </CardHeader>
          <CardContent>
            {implementationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={implementationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {implementationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Status-Daten
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teilnahme-Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Teilnahme-Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="participants" fill="#82ca9d" name="Aktive Teilnehmer" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Keine Teilnahme-Daten
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ROI und Erfolgs-Metriken */}
      <Card>
        <CardHeader>
          <CardTitle>Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalIdeas}</div>
              <div className="text-sm text-gray-600">Ideen gesamt</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{implementedIdeas}</div>
              <div className="text-sm text-gray-600">Umgesetzt</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{uniqueParticipants}</div>
              <div className="text-sm text-gray-600">Aktive Teilnehmer</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InnovationAnalytics;
