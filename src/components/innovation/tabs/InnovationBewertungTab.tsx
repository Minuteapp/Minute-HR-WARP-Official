import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, Target, Users, TrendingUp, Zap, DollarSign, 
  AlertTriangle, Leaf, Search, Sparkles, Loader2
} from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const bewertungsDimensionen = [
  { id: 'strategic', title: 'Strategischer Fit', subtitle: 'Ausrichtung an Unternehmenszielen', icon: Target, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  { id: 'customer', title: 'Kundennutzen', subtitle: 'Mehrwert für Kunden', icon: Users, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
  { id: 'employee', title: 'Mitarbeiter-Impact', subtitle: 'Verbesserung für MA', icon: TrendingUp, bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { id: 'effort', title: 'Aufwand', subtitle: 'Implementierungsaufwand', icon: Zap, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { id: 'cost', title: 'Kosten', subtitle: 'Investitionsbedarf', icon: DollarSign, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  { id: 'risk', title: 'Risiko', subtitle: 'Umsetzungsrisiken', icon: AlertTriangle, bgColor: 'bg-red-100', textColor: 'text-red-600' },
  { id: 'esg', title: 'ESG-Relevanz', subtitle: 'Nachhaltigkeitsbeitrag', icon: Leaf, bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { id: 'scalability', title: 'Skalierbarkeit', subtitle: 'Ausbaupotenzial', icon: Star, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
];

const categoryColors: Record<string, string> = {
  prozess: '#3B82F6',
  produkt: '#8B5CF6',
  service: '#EC4899',
  technologie: '#06B6D4',
  organisation: '#F97316',
  nachhaltigkeit: '#22C55E',
  kosten: '#1E3A8A',
  process: '#3B82F6',
  product: '#8B5CF6',
  technology: '#06B6D4',
  organization: '#F97316',
  sustainability: '#22C55E',
  cost: '#1E3A8A',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-semibold">{data.title}</p>
        <p className="text-sm text-gray-600">Impact: {data.impact}</p>
        <p className="text-sm text-gray-600">Aufwand: {data.effort}</p>
        <p className="text-sm font-medium text-purple-600">Score: {data.score}</p>
      </div>
    );
  }
  return null;
};

const InnovationBewertungTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Lade Ideen zur Bewertung aus der Datenbank
  const { data: ideasForReview = [], isLoading } = useQuery({
    queryKey: ['innovation-ideas-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .in('status', ['new', 'in_review', 'evaluation'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Lade alle bewerteten Ideen für die Matrix
  const { data: allIdeas = [] } = useQuery({
    queryKey: ['innovation-ideas-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .not('score', 'is', null)
        .order('score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Transformiere Daten für die Matrix - nur Ideen mit echten Scores
  const matrixData = allIdeas
    .filter(idea => idea.effort_score !== null && idea.impact_score !== null)
    .map(idea => ({
      x: idea.effort_score || 0,
      y: idea.impact_score || 0,
      title: idea.title,
      category: idea.category || 'process',
      impact: idea.impact_score || 0,
      effort: idea.effort_score || 0,
      score: idea.score || 0,
    }));

  // Priorisierte Ideen (Top 5 nach Score)
  const prioritizedIdeas = allIdeas.slice(0, 5).map((idea, index) => ({
    rank: index + 1,
    title: idea.title,
    priority: idea.score >= 8 ? 'Hoch' : idea.score >= 6 ? 'Mittel' : 'Niedrig',
    impact: idea.impact_score || 5,
    effort: idea.effort_score || 5,
    score: idea.score || 5,
  }));

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      technologie: 'bg-cyan-500 text-white',
      technology: 'bg-cyan-500 text-white',
      prozess: 'bg-blue-500 text-white',
      process: 'bg-blue-500 text-white',
      nachhaltigkeit: 'bg-green-500 text-white',
      sustainability: 'bg-green-500 text-white',
      produkt: 'bg-purple-500 text-white',
      product: 'bg-purple-500 text-white',
      service: 'bg-pink-500 text-white',
      organisation: 'bg-orange-500 text-white',
      organization: 'bg-orange-500 text-white',
    };
    return colors[category] || 'bg-gray-500 text-white';
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
      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Star className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">Strukturierte Bewertung & Priorisierung</h3>
            <p className="text-sm text-purple-700 mt-1">
              Bewerten Sie Ideen anhand definierter Dimensionen und nutzen Sie die Impact-vs-Aufwand-Matrix zur strategischen Priorisierung. KI unterstützt mit Empfehlungen.
            </p>
            {ideasForReview.length > 0 && (
              <p className="text-sm text-green-600 mt-2 font-medium cursor-pointer hover:underline">
                {ideasForReview.length} Ideen warten auf Ihre Bewertung.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ideen zur Bewertung */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Ideen zur Bewertung ({ideasForReview.length})</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ideen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="reviewed">Bewertet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">{ideasForReview.length} Ideen gesamt</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 pro Seite</SelectItem>
                <SelectItem value="25">25 pro Seite</SelectItem>
                <SelectItem value="50">50 pro Seite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ideasForReview.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Keine Ideen zur Bewertung vorhanden</p>
          ) : (
            ideasForReview.map((idea) => (
              <div key={idea.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{idea.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={getCategoryBadgeColor(idea.category || 'process')}>{idea.category || 'Prozess'}</Badge>
                      <span className="text-sm text-gray-500">
                        von {idea.submitted_by_name || 'Unbekannt'} • {idea.department || 'Unbekannt'} • {idea.created_at ? new Date(idea.created_at).toLocaleDateString('de-DE') : ''}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Bewerten
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bewertungsdimensionen */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Bewertungsdimensionen</h3>
        <div className="grid grid-cols-4 gap-4">
          {bewertungsDimensionen.map((dim) => (
            <Card key={dim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dim.bgColor}`}>
                    <dim.icon className={`h-5 w-5 ${dim.textColor}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{dim.title}</h4>
                    <p className="text-xs text-gray-500">{dim.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Impact-vs-Aufwand Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Impact-vs-Aufwand-Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] relative">
            {/* Quadrant Labels */}
            <div className="absolute top-4 left-16 text-xs text-gray-400 z-10">Aufwendig, geringer Impact</div>
            <div className="absolute top-4 right-16 text-xs text-gray-400 z-10">Quick Wins</div>
            <div className="absolute bottom-16 left-16 text-xs text-gray-400 z-10">Niedrige Priorität</div>
            <div className="absolute bottom-16 right-16 text-xs text-gray-400 z-10">Major Projects</div>
            
            {matrixData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Aufwand" 
                    domain={[0, 10]}
                    label={{ value: 'Aufwand (niedrig → hoch)', position: 'bottom', offset: 0 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Impact" 
                    domain={[0, 10]}
                    label={{ value: 'Impact (niedrig → hoch)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter name="Ideen" data={matrixData} fill="#8884d8">
                    {matrixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || '#8884d8'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Keine bewerteten Ideen für die Matrix vorhanden
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {Object.entries(categoryColors).slice(0, 7).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priorisierte Ideen */}
      <Card>
        <CardHeader>
          <CardTitle>Priorisierte Ideen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prioritizedIdeas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Keine priorisierten Ideen vorhanden</p>
            ) : (
              prioritizedIdeas.map((idea) => (
                <div key={idea.rank} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="font-bold text-purple-600">#{idea.rank}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{idea.title}</h4>
                  </div>
                  <Badge variant={idea.priority === 'Hoch' ? 'destructive' : 'secondary'}>
                    {idea.priority}
                  </Badge>
                  <div className="text-sm text-gray-600 w-20 text-center">
                    Impact: {idea.impact}
                  </div>
                  <div className="text-sm text-gray-600 w-20 text-center">
                    Aufwand: {idea.effort}
                  </div>
                  <div className="w-16 text-right">
                    <span className="font-bold text-purple-600">{idea.score}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* KI-Empfehlungen */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">KI-Empfehlungen zur Priorisierung</h3>
        </div>
        <div className="space-y-4">
          {prioritizedIdeas.length > 0 ? (
            prioritizedIdeas.slice(0, 3).map((idea, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge className={index === 0 ? 'bg-red-500 text-white' : index === 1 ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'}>
                  {index === 0 ? 'Quick Win' : index === 1 ? 'Strategisch' : 'Kulturell'}
                </Badge>
                <div>
                  <span className="font-medium text-purple-900">{idea.title}</span>
                  <p className="text-sm text-purple-700">
                    Score: {idea.score} - {idea.priority === 'Hoch' ? 'Hohe Priorität empfohlen' : 'Mittlere Priorität'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-purple-700">Keine Empfehlungen verfügbar - bewerten Sie zunächst einige Ideen.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnovationBewertungTab;
