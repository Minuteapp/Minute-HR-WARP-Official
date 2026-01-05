import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  Clock, 
  CheckCircle, 
  Euro, 
  Leaf, 
  Target, 
  Users, 
  TrendingUp,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

const InnovationOverviewTab = () => {
  // Lade Ideen aus der Datenbank
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-ideas-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Berechne Statistiken aus echten Daten
  const totalIdeas = ideas.length;
  const activeIdeas = ideas.filter(i => ['in_review', 'in_discussion', 'experiment', 'evaluation'].includes(i.status)).length;
  const implementedIdeas = ideas.filter(i => ['implementation', 'scaled'].includes(i.status)).length;
  const esgIdeas = ideas.filter(i => i.category === 'sustainability' || i.category === 'nachhaltigkeit').length;
  
  // Status-Verteilung für Funnel
  const statusCounts: Record<string, number> = {};
  ideas.forEach(idea => {
    statusCounts[idea.status] = (statusCounts[idea.status] || 0) + 1;
  });

  // Team-Verteilung
  const teamCounts: Record<string, { ideen: number; umgesetzt: number }> = {};
  ideas.forEach(idea => {
    const team = idea.department || 'Unbekannt';
    if (!teamCounts[team]) {
      teamCounts[team] = { ideen: 0, umgesetzt: 0 };
    }
    teamCounts[team].ideen++;
    if (['implementation', 'scaled'].includes(idea.status)) {
      teamCounts[team].umgesetzt++;
    }
  });

  // KPI Cards basierend auf echten Daten
  const kpiCards = [
    { label: 'Eingereichte Ideen', value: totalIdeas.toString(), subtext: 'Gesamt', icon: Lightbulb, bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { label: 'Aktive Ideen', value: activeIdeas.toString(), subtext: 'In Bearbeitung', icon: Clock, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Umgesetzte Innovationen', value: implementedIdeas.toString(), subtext: 'Erfolgreich implementiert', icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Einsparungen', value: '€0', subtext: 'Geschätzte Ersparnis', icon: Euro, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  ];

  const kpiCardsRow2 = [
    { label: 'ESG-Impact', value: esgIdeas.toString(), subtext: 'Nachhaltige Ideen', icon: Leaf, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Beteiligungsquote', value: totalIdeas > 0 ? '–' : '0%', subtext: 'Aktive Mitarbeiter', icon: Target, bgColor: 'bg-red-100', iconColor: 'text-red-600' },
    { label: 'Teams aktiv', value: Object.keys(teamCounts).length.toString(), subtext: 'Mit Ideen', icon: Users, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Trend', value: '–', subtext: 'vs. Vorquartal', icon: TrendingUp, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  // Funnel Data aus echten Daten
  const funnelData = [
    { name: 'Eingereicht', value: totalIdeas, fill: '#7C3AED' },
    { name: 'In Diskussion', value: statusCounts['in_discussion'] || 0, fill: '#7C3AED' },
    { name: 'In Bewertung', value: (statusCounts['evaluation'] || 0) + (statusCounts['in_review'] || 0), fill: '#7C3AED' },
    { name: 'Experiment', value: statusCounts['experiment'] || 0, fill: '#7C3AED' },
    { name: 'Umsetzung', value: statusCounts['implementation'] || 0, fill: '#7C3AED' },
    { name: 'Skaliert', value: statusCounts['scaled'] || 0, fill: '#7C3AED' },
  ];

  // Team Activity Data
  const teamActivityData = Object.entries(teamCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.ideen - a.ideen)
    .slice(0, 7);

  // Top Ideas (nach Votes oder Score)
  const topIdeas = ideas
    .filter(i => i.votes_count > 0 || i.score)
    .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
    .slice(0, 5)
    .map((idea, index) => ({
      rank: index + 1,
      title: idea.title,
      author: `${idea.submitted_by_name || 'Unbekannt'}, ${idea.department || 'Unbekannt'}`,
      votes: idea.votes_count || 0,
      comments: idea.comments_count || 0,
      status: idea.status,
    }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scaled':
        return 'bg-green-500 text-white';
      case 'implementation':
        return 'bg-green-500 text-white';
      case 'evaluation':
      case 'in_review':
        return 'bg-red-400 text-white';
      case 'experiment':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.subtext}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCardsRow2.map((kpi, index) => (
          <Card key={index} className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.subtext}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KI Summary Box */}
      <div className="bg-violet-600 text-white rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">KI-Zusammenfassung</span>
        </div>
        <p className="text-sm text-violet-100">
          {totalIdeas > 0 
            ? `Aktuell sind ${totalIdeas} Ideen im System erfasst. ${implementedIdeas} davon wurden bereits umgesetzt. ${activeIdeas} Ideen befinden sich in aktiver Bearbeitung.`
            : 'Noch keine Ideen im System erfasst. Starten Sie den Innovationsprozess, indem Sie erste Ideen einreichen.'}
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ideen Funnel */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Ideen-Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#7C3AED" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Activity Chart */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Innovationsaktivität nach Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {teamActivityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={teamActivityData} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Bar dataKey="ideen" fill="#7C3AED" name="Ideen" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="umgesetzt" fill="#22C55E" name="Umgesetzt" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-violet-600"></div>
                    <span className="text-xs text-gray-600">Ideen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-xs text-gray-600">Umgesetzt</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Keine Team-Daten verfügbar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Ideas */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top-Ideen dieser Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topIdeas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Keine Top-Ideen vorhanden</p>
            ) : (
              topIdeas.map((idea) => (
                <div key={idea.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                      {idea.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{idea.title}</p>
                      <p className="text-sm text-gray-500">{idea.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{idea.votes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{idea.comments}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(idea.status)}`}>
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InnovationOverviewTab;
