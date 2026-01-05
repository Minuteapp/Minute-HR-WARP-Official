import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, LayoutGrid, Users, Calendar, Leaf, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PortfolioIdeaDetailDialog from './PortfolioIdeaDetailDialog';

const InnovationPortfolioTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<'kategorien' | 'teams' | 'timeline'>('kategorien');
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);

  // Lade alle Ideen aus der Datenbank
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-ideas-portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Berechne Kategorien-Daten
  const kategorienData = (() => {
    const categories: Record<string, { count: number; ideen: any[] }> = {
      'process': { count: 0, ideen: [] },
      'technology': { count: 0, ideen: [] },
      'sustainability': { count: 0, ideen: [] },
      'organization': { count: 0, ideen: [] },
      'product': { count: 0, ideen: [] },
      'service': { count: 0, ideen: [] },
      'cost': { count: 0, ideen: [] },
    };
    
    ideas.forEach(idea => {
      const cat = idea.category || 'process';
      if (categories[cat]) {
        categories[cat].count++;
        categories[cat].ideen.push({
          id: idea.id,
          titel: idea.title,
          status: idea.status,
        });
      }
    });
    
    const categoryConfig: Record<string, { name: string; color: string }> = {
      'process': { name: 'Prozess', color: 'bg-purple-500' },
      'technology': { name: 'Technologie', color: 'bg-blue-500' },
      'sustainability': { name: 'Nachhaltigkeit', color: 'bg-green-500' },
      'organization': { name: 'Organisation', color: 'bg-orange-500' },
      'product': { name: 'Produkt', color: 'bg-pink-500' },
      'service': { name: 'Service', color: 'bg-red-500' },
      'cost': { name: 'Kosten', color: 'bg-yellow-500' },
    };
    
    return Object.entries(categories).map(([key, data]) => ({
      name: categoryConfig[key]?.name || key,
      count: data.count,
      color: categoryConfig[key]?.color || 'bg-gray-500',
      ideen: data.ideen,
    }));
  })();

  // Chart-Daten für Kategorien
  const kategorienChartData = kategorienData.map(k => ({
    name: k.name,
    anzahl: k.count,
    fill: '#8B5CF6',
  }));

  // Berechne Teams-Daten
  const teamsData = (() => {
    const teams: Record<string, { ideen: number; umgesetzt: number }> = {};
    
    ideas.forEach(idea => {
      const team = idea.department || 'Unbekannt';
      if (!teams[team]) {
        teams[team] = { ideen: 0, umgesetzt: 0 };
      }
      teams[team].ideen++;
      if (['implementation', 'scaled'].includes(idea.status)) {
        teams[team].umgesetzt++;
      }
    });
    
    return Object.entries(teams)
      .map(([name, data]) => ({
        name,
        ...data,
        aktivitaet: data.ideen > 5 ? 'Sehr hoch' : data.ideen > 2 ? 'Hoch' : 'Mittel',
        punktFarbe: data.ideen > 5 ? 'bg-green-500' : data.ideen > 2 ? 'bg-yellow-500' : 'bg-orange-500',
        inArbeit: 0,
      }))
      .sort((a, b) => b.ideen - a.ideen);
  })();

  const teamsChartData = teamsData.slice(0, 7);

  // Timeline-Daten (gruppiert nach Quartal)
  const timelineData = (() => {
    const quarters: Record<string, { items: any[] }> = {};
    
    ideas.forEach(idea => {
      if (idea.created_at) {
        const date = new Date(idea.created_at);
        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
        
        if (!quarters[quarter]) {
          quarters[quarter] = { items: [] };
        }
        quarters[quarter].items.push({
          titel: idea.title,
          status: idea.status,
          badgeColor: idea.status === 'scaled' ? 'bg-green-500' : idea.status === 'implementation' ? 'bg-blue-500' : 'bg-gray-500',
        });
      }
    });
    
    return Object.entries(quarters)
      .map(([quartal, data]) => ({
        quartal,
        label: quartal.includes(new Date().getFullYear().toString()) ? 'Aktuell' : 'Vergangen',
        items: data.items.slice(0, 3),
      }))
      .slice(0, 4);
  })();

  // Strategische Ausrichtung
  const strategieData = [
    { 
      titel: 'ESG & Nachhaltigkeit', 
      icon: Leaf, 
      iconBg: 'bg-green-100', 
      iconColor: 'text-green-600',
      ideen: ideas.filter(i => i.category === 'sustainability').length,
      impact: 'Hoch'
    },
    { 
      titel: 'Digitale Transformation', 
      icon: Zap, 
      iconBg: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      ideen: ideas.filter(i => i.category === 'technology').length,
      impact: 'Sehr hoch'
    },
    { 
      titel: 'Effizienzsteigerung', 
      icon: TrendingUp, 
      iconBg: 'bg-purple-100', 
      iconColor: 'text-purple-600',
      ideen: ideas.filter(i => i.category === 'process' || i.category === 'cost').length,
      impact: 'Hoch'
    },
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
      {/* Info-Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">Innovationsportfolio & Roadmap</h3>
            <p className="text-sm text-purple-700 mt-1">
              Übersicht über alle Innovationsideen nach Kategorien, Teams und strategischer Timeline. 
              Nutzen Sie die verschiedenen Ansichten für Portfolio-Management und strategische Planung.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Tab Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeSubTab === 'kategorien' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('kategorien')}
          className={activeSubTab === 'kategorien' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Nach Kategorien
        </Button>
        <Button
          variant={activeSubTab === 'teams' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('teams')}
          className={activeSubTab === 'teams' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          Nach Teams
        </Button>
        <Button
          variant={activeSubTab === 'timeline' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('timeline')}
          className={activeSubTab === 'timeline' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Timeline
        </Button>
      </div>

      {/* Nach Kategorien View */}
      {activeSubTab === 'kategorien' && (
        <div className="space-y-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio nach Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {kategorienChartData.some(k => k.anzahl > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kategorienChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="anzahl" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Keine Kategorien-Daten verfügbar
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kategorie-Karten */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kategorienData.map((kategorie) => (
              <Card key={kategorie.name} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${kategorie.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {kategorie.count}
                    </div>
                    <div>
                      <CardTitle className="text-base">{kategorie.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{kategorie.count} Ideen</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {kategorie.ideen.length > 0 ? (
                    <ul className="space-y-2">
                      {kategorie.ideen.slice(0, 3).map((idee) => (
                        <li 
                          key={idee.id} 
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2"
                          onClick={() => {
                            const fullIdea = ideas.find(i => i.id === idee.id);
                            if (fullIdea) setSelectedIdea(fullIdea);
                          }}
                        >
                          <span className="text-sm font-medium truncate">{idee.titel}</span>
                          <span className="text-xs text-muted-foreground">{idee.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Keine Ideen in dieser Kategorie</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Nach Teams View */}
      {activeSubTab === 'teams' && (
        <div className="space-y-6">
          {/* Grouped Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Innovationsaktivität nach Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {teamsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ideen" name="Ideen" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="umgesetzt" name="Umgesetzt" fill="#22C55E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Keine Team-Daten verfügbar
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team-Heatmap */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Team-Heatmap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamsData.length > 0 ? (
                teamsData.map((team) => (
                  <Card key={team.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 ${team.punktFarbe} rounded-full`} />
                        <span className="font-semibold">{team.name}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aktivität:</span>
                          <span>{team.aktivitaet}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ideen:</span>
                          <span>{team.ideen}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Umgesetzt:</span>
                          <span className="text-purple-600 font-medium">{team.umgesetzt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-3">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Keine Team-Daten verfügbar</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Innovations-Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Innovations-Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timelineData.length > 0 ? (
                  timelineData.map((quartal, idx) => (
                    <div key={quartal.quartal} className="flex gap-4">
                      {/* Timeline-Linie */}
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-purple-600 rounded-full" />
                        {idx < timelineData.length - 1 && (
                          <div className="w-0.5 h-full bg-purple-200 flex-1 mt-2" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold">{quartal.quartal}</h4>
                          <Badge variant="outline" className="text-xs">{quartal.label}</Badge>
                        </div>
                        <div className="space-y-2">
                          {quartal.items.map((item, itemIdx) => (
                            <div 
                              key={itemIdx} 
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                            >
                              <span className="font-medium">{item.titel}</span>
                              <Badge className={`${item.badgeColor} text-white border-0`}>
                                {item.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Keine Timeline-Daten verfügbar</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Strategische Ausrichtung */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Strategische Ausrichtung</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {strategieData.map((item) => (
                <Card key={item.titel}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${item.iconBg} rounded-lg`}>
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <span className="font-semibold">{item.titel}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ideen:</span>
                        <span>{item.ideen} Ideen</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="text-green-600">{item.impact}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedIdea && (
        <PortfolioIdeaDetailDialog
          idea={{
            id: selectedIdea.id,
            titel: selectedIdea.title,
            beschreibung: selectedIdea.description,
            kategorie: selectedIdea.category,
            status: selectedIdea.status,
            votes: selectedIdea.votes_count || 0,
            eingereichtVon: selectedIdea.submitted_by_name,
            team: selectedIdea.department,
            datum: selectedIdea.created_at ? new Date(selectedIdea.created_at).toLocaleDateString('de-DE') : '',
            betroffeneBereiche: [],
            tags: selectedIdea.tags || [],
            nutzen: { kosteneinsparung: '–', qualitaet: '–', zufriedenheit: '–' },
            kiInsights: [],
            bewertung: { gesamt: selectedIdea.score || 0, dimensionen: [] },
            kommentare: [],
            experiment: { hypothese: '', dauer: '', budget: '', verantwortlich: '', kpis: [], ergebnisse: '' },
          }}
          open={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
};

export default InnovationPortfolioTab;
