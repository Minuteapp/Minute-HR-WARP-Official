import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, CheckCircle, Euro, TrendingUp, Clock, 
  Calendar, Users, Leaf, Sparkles, Loader2 
} from 'lucide-react';

const integrationen = [
  { title: '→ Projekt', icon: Rocket, color: 'text-purple-600', bgColor: 'bg-purple-100', description: 'Idee wird automatisch als Projekt angelegt mit Vorlage, Team und Meilensteinen' },
  { title: '→ Roadmap', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-100', description: 'Innovation wird in strategische Roadmap eingetragen mit Timeline' },
  { title: '→ Budget', icon: Euro, color: 'text-green-600', bgColor: 'bg-green-100', description: 'Budgetfreigabe und Kostenverfolgung über Finance-Modul' },
  { title: '→ Performance', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100', description: 'Innovationsbeitrag fließt in Mitarbeiter-Performance ein' },
  { title: '→ Weiterbildung', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100', description: 'Neue Skills erforderlich? Automatische Schulungsempfehlungen' },
  { title: '→ ESG', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-100', description: 'Nachhaltigkeitsinnovationen tracken im ESG-Modul' },
];

const InnovationUmsetzungTab = () => {
  // Lade Ideen in Umsetzung und skaliert aus der Datenbank
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['innovation-implementation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .in('status', ['implementation', 'scaled'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const inUmsetzung = ideas.filter(i => i.status === 'implementation');
  const skaliert = ideas.filter(i => i.status === 'scaled');

  // KPI Cards basierend auf echten Daten
  const kpiCards = [
    { title: 'In Umsetzung', value: inUmsetzung.length.toString(), icon: Clock, bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
    { title: 'Skaliert', value: skaliert.length.toString(), icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Realisierte Einsparungen', value: '€0', icon: Euro, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'ROI', value: '–', icon: TrendingUp, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
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
      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Rocket className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">Umsetzung & Skalierung</h3>
            <p className="text-sm text-purple-700 mt-1">
              Validierte Ideen werden in Projekte überführt, mit Budget und Ressourcen ausgestattet und systematisch umgesetzt. Erfolgreiche Innovationen werden skaliert.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Umsetzungs-Pipeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Umsetzungs-Pipeline</h3>
        
        {/* In Umsetzung */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium">In Umsetzung ({inUmsetzung.length})</h4>
          </div>
          <div className="space-y-4">
            {inUmsetzung.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Keine Ideen in Umsetzung</p>
                </CardContent>
              </Card>
            ) : (
              inUmsetzung.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.department || 'Unbekannt'}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        In Umsetzung
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Kategorie</p>
                        <p className="font-medium">{item.category || 'Unbekannt'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Eingereicht von</p>
                        <p className="font-medium">{item.submitted_by_name || 'Unbekannt'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="font-medium text-purple-600">{item.score || '–'}</p>
                      </div>
                    </div>

                    {item.description && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Erfolgreich skaliert */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-700">Erfolgreich skaliert ({skaliert.length})</h4>
          </div>
          <div className="space-y-4">
            {skaliert.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Keine skalierten Ideen</p>
                </CardContent>
              </Card>
            ) : (
              skaliert.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.department || 'Unbekannt'}</p>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Skaliert
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Kategorie</p>
                        <p className="font-medium">{item.category || 'Unbekannt'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Eingereicht von</p>
                        <p className="font-medium">{item.submitted_by_name || 'Unbekannt'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="font-medium text-purple-600">{item.score || '–'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Automatische Übergaben & Integrationen */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Automatische Übergaben & Integrationen</h3>
        <div className="grid grid-cols-3 gap-4">
          {integrationen.map((item) => (
            <Card key={item.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Erfolgsgeschichten */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Erfolgsgeschichten</h3>
        <div className="grid grid-cols-2 gap-4">
          {skaliert.length === 0 ? (
            <Card className="col-span-2">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Noch keine Erfolgsgeschichten - skalieren Sie Ihre ersten Innovationen!</p>
              </CardContent>
            </Card>
          ) : (
            skaliert.slice(0, 4).map((story) => (
              <Card key={story.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{story.title}</h4>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Score: {story.score || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">{story.department || 'Unbekannt'}</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium mt-2">Erfolgreich skaliert</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* KI-Empfehlungen */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">KI-Empfehlungen für nächste Schritte</h3>
        </div>
        <div className="space-y-4">
          {ideas.length > 0 ? (
            <>
              <div>
                <span className="font-medium text-purple-900">Pipeline-Status</span>
                <p className="text-sm text-purple-700">{inUmsetzung.length} Ideen befinden sich aktuell in der Umsetzung. {skaliert.length} wurden bereits erfolgreich skaliert.</p>
              </div>
              <div>
                <span className="font-medium text-purple-900">Nächste Schritte</span>
                <p className="text-sm text-purple-700">Prüfen Sie den Fortschritt der laufenden Umsetzungen und dokumentieren Sie Erfolge für zukünftige Referenzen.</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-purple-700">Noch keine Ideen in der Umsetzungsphase. Validieren Sie Experimente, um Ideen in die Umsetzung zu überführen.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnovationUmsetzungTab;
