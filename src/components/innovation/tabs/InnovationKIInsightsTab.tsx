import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Target, 
  Lightbulb,
  BarChart3,
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InnovationKIInsightsTab = () => {
  // Lade alle Ideen für Analysen
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-ideas-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Berechne Trend-Daten aus echten Daten (gruppiert nach Monat)
  const trendData = (() => {
    const monthlyData: Record<string, { ideen: number; umsetzung: number }> = {};
    
    ideas.forEach(idea => {
      if (idea.created_at) {
        const date = new Date(idea.created_at);
        const monthKey = date.toLocaleDateString('de-DE', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ideen: 0, umsetzung: 0 };
        }
        monthlyData[monthKey].ideen++;
        
        if (['implementation', 'scaled'].includes(idea.status)) {
          monthlyData[monthKey].umsetzung++;
        }
      }
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    })).slice(-6);
  })();

  // Berechne Themen-Clustering aus echten Kategorien
  const themenClustering = (() => {
    const categoryCounts: Record<string, number> = {};
    ideas.forEach(idea => {
      const cat = idea.category || 'Sonstige';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    const total = ideas.length || 1;
    return Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        percent: Math.round((count / total) * 100),
        trend: '+0%',
        color1: 'bg-purple-500',
        color2: 'bg-orange-400'
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4);
  })();

  // Berechne Kultur-Metriken
  const totalIdeas = ideas.length;
  const implementedIdeas = ideas.filter(i => ['implementation', 'scaled'].includes(i.status)).length;
  const uniqueSubmitters = new Set(ideas.map(i => i.submitted_by_name)).size;

  const kulturMetriken = [
    { label: 'Eingereichte Ideen', value: totalIdeas.toString(), trend: '' },
    { label: 'Umgesetzt', value: implementedIdeas.toString(), trend: '' },
    { label: 'Einreicher', value: uniqueSubmitters.toString(), trend: '' }
  ];

  // Berechne Insight-Karten basierend auf echten Daten
  const insightCards = [
    {
      badge: totalIdeas > 0 ? 'Positiv' : 'Neutral',
      badgeColor: totalIdeas > 0 ? 'bg-green-500' : 'bg-gray-500',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      Icon: TrendingUp,
      title: 'Innovationsaktivität',
      description: totalIdeas > 0 
        ? `${totalIdeas} Ideen wurden eingereicht. ${implementedIdeas} davon wurden bereits umgesetzt.`
        : 'Noch keine Ideen eingereicht. Starten Sie den Innovationsprozess!'
    },
    {
      badge: implementedIdeas > 0 ? 'Erfolg' : 'Handlungsbedarf',
      badgeColor: implementedIdeas > 0 ? 'bg-green-500' : 'bg-red-500',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      Icon: AlertTriangle,
      title: 'Umsetzungsquote',
      description: totalIdeas > 0 
        ? `${Math.round((implementedIdeas / totalIdeas) * 100)}% der Ideen wurden umgesetzt.`
        : 'Noch keine Daten zur Umsetzungsquote verfügbar.'
    },
    {
      badge: 'Beobachtung',
      badgeColor: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: Users,
      title: 'Beteiligung',
      description: `${uniqueSubmitters} verschiedene Personen haben Ideen eingereicht.`
    },
    {
      badge: 'Chance',
      badgeColor: 'bg-purple-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      Icon: Target,
      title: 'Potenzial',
      description: `${ideas.filter(i => i.status === 'new' || i.status === 'in_review').length} Ideen warten auf Bewertung.`
    }
  ];

  // Prädiktive Insights
  const praediktiveInsights = [
    {
      title: 'Erwartete Entwicklung',
      description: totalIdeas > 0 ? `Basierend auf dem aktuellen Trend: ${totalIdeas} Ideen` : 'Noch keine Daten verfügbar',
      konfidenz: totalIdeas > 0 ? 75 : 0
    },
    {
      title: 'Umsetzungsprognose',
      description: implementedIdeas > 0 ? `Aktuelle Umsetzungsrate: ${Math.round((implementedIdeas / totalIdeas) * 100)}%` : 'Noch keine Umsetzungen',
      konfidenz: implementedIdeas > 0 ? 70 : 0
    },
    {
      title: 'Wachstumspotenzial',
      description: 'Steigern Sie die Beteiligung durch regelmäßige Kommunikation',
      konfidenz: 65
    }
  ];

  // KI-Empfehlungen
  const kiEmpfehlungen = totalIdeas > 0 ? [
    {
      prioritaet: 'Hoch',
      prioritaetColor: 'bg-red-500',
      title: 'Ideen schneller bewerten',
      description: `${ideas.filter(i => i.status === 'new').length} Ideen haben noch keine Bewertung erhalten.`,
      impact: 'Schnellere Feedback-Zyklen erhöhen Engagement'
    },
    {
      prioritaet: 'Mittel',
      prioritaetColor: 'bg-orange-500',
      title: 'Erfolge kommunizieren',
      description: `${implementedIdeas} umgesetzte Ideen können als Erfolgsgeschichten geteilt werden.`,
      impact: 'Motivation durch Sichtbarkeit von Erfolgen'
    }
  ] : [
    {
      prioritaet: 'Hoch',
      prioritaetColor: 'bg-purple-500',
      title: 'Innovation starten',
      description: 'Ermutigen Sie Mitarbeiter, erste Ideen einzureichen.',
      impact: 'Innovationskultur aufbauen'
    }
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
      {/* Violette Info-Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">KI-gestützte Innovation Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Analyse Ihrer Innovationsaktivitäten basierend auf echten Daten aus der Datenbank.
          </p>
        </div>
      </div>

      {/* 4 Insight-Karten */}
      <div className="grid grid-cols-2 gap-4">
        {insightCards.map((card, index) => (
          <Card key={index} className="bg-white border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${card.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <card.Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${card.badgeColor} text-white text-xs`}>{card.badge}</Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{card.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend-Analyse Line-Chart */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Trend-Analyse: Ideen & Umsetzung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ideen" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    name="Ideen"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="umsetzung" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    name="Umsetzung"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Noch keine Trend-Daten verfügbar
              </div>
            )}
          </div>

          {/* KI-Interpretation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <span className="font-medium text-sm text-purple-800">KI-Interpretation:</span>
                <p className="text-sm text-purple-700 mt-1">
                  {totalIdeas > 0 
                    ? `${totalIdeas} Ideen wurden eingereicht, davon ${implementedIdeas} umgesetzt (${Math.round((implementedIdeas / totalIdeas) * 100)}% Umsetzungsrate).`
                    : 'Starten Sie mit der Erfassung von Ideen, um Trends analysieren zu können.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themen-Clustering */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Themen-Clustering: Wo liegt der Fokus?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {themenClustering.length > 0 ? (
            themenClustering.map((thema, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{thema.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{thema.percent}% der Ideen</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className={`${thema.color1} h-full`} style={{ width: `${thema.percent}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Keine Kategorien-Daten verfügbar</p>
          )}
        </CardContent>
      </Card>

      {/* Kultur-Analyse */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Kultur-Analyse: Engagement & Beteiligung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 3 Metriken */}
          <div className="grid grid-cols-3 gap-4">
            {kulturMetriken.map((metrik, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{metrik.value}</p>
                <p className="text-sm text-gray-600">{metrik.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prädiktive Insights */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Prädiktive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {praediktiveInsights.map((insight, index) => (
              <Card key={index} className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Konfidenz</span>
                      <span className="font-medium text-purple-600">{insight.konfidenz}%</span>
                    </div>
                    <Progress value={insight.konfidenz} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KI-Empfehlungen zur Optimierung */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">KI-Empfehlungen zur Optimierung</h3>
        </div>
        <div className="space-y-3">
          {kiEmpfehlungen.map((empfehlung, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <Badge className={`${empfehlung.prioritaetColor} text-white text-xs`}>
                  {empfehlung.prioritaet}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{empfehlung.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{empfehlung.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">{empfehlung.impact}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InnovationKIInsightsTab;
