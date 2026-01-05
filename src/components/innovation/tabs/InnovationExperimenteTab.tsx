import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, CheckCircle, Euro, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

const frameworkSteps = [
  { step: 1, title: 'Hypothese definieren', description: 'Was soll getestet werden? Welche Annahme möchten Sie validieren?' },
  { step: 2, title: 'Ziel & KPIs festlegen', description: 'Welche messbaren Erfolgsmetriken definieren Sie?' },
  { step: 3, title: 'Pilot durchführen', description: 'Kleiner Scope, kurze Dauer, schnelles Lernen' },
  { step: 4, title: 'Daten sammeln', description: 'Messungen, Feedback, qualitative & quantitative Daten' },
  { step: 5, title: 'Auswerten', description: 'Hat das Experiment die Hypothese bestätigt?' },
  { step: 6, title: 'Entscheiden', description: 'Skalieren, anpassen oder verwerfen' },
];

const InnovationExperimenteTab = () => {
  // Lade Experimente aus der Datenbank (Ideen mit Status 'experiment')
  const { data: experiments = [], isLoading } = useQuery({
    queryKey: ['innovation-experiments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('innovation_ideas')
        .select('*')
        .in('status', ['experiment', 'scaled', 'implementation'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const laufendeExperimente = experiments.filter(e => e.status === 'experiment');
  const abgeschlosseneExperimente = experiments.filter(e => ['scaled', 'implementation'].includes(e.status));

  // KPI Cards basierend auf echten Daten
  const kpiCards = [
    { title: 'Aktive Experimente', value: laufendeExperimente.length.toString(), icon: FlaskConical, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { title: 'Abgeschlossen', value: abgeschlosseneExperimente.length.toString(), icon: CheckCircle, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Gesamt-Budget', value: '€0', icon: Euro, bgColor: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Erfolgsrate', value: experiments.length > 0 ? `${Math.round((abgeschlosseneExperimente.length / experiments.length) * 100)}%` : '0%', icon: TrendingUp, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
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
            <FlaskConical className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">Experimente & Validierung</h3>
            <p className="text-sm text-purple-700 mt-1">
              Schnell testen statt lange diskutieren. Definieren Sie Hypothesen, starten Sie Piloten und validieren Sie Ideen mit echten Daten, bevor Sie in die volle Umsetzung gehen.
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

      {/* Laufende Experimente */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Laufende Experimente</h3>
        <div className="space-y-4">
          {laufendeExperimente.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Keine laufenden Experimente</p>
              </CardContent>
            </Card>
          ) : (
            laufendeExperimente.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold">{exp.title}</h4>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      In Durchführung
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Beschreibung</p>
                    <p className="text-gray-700">{exp.description || 'Keine Beschreibung vorhanden'}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Kategorie</p>
                      <p className="font-medium">{exp.category || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Abteilung</p>
                      <p className="font-medium">{exp.department || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Eingereicht von</p>
                      <p className="font-medium">{exp.submitted_by_name || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="font-medium">{exp.score || '–'}</p>
                    </div>
                  </div>

                  {exp.tags && exp.tags.length > 0 && (
                    <div className="flex gap-2">
                      {exp.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Abgeschlossene Experimente */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Abgeschlossene Experimente</h3>
        <div className="space-y-4">
          {abgeschlosseneExperimente.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Keine abgeschlossenen Experimente</p>
              </CardContent>
            </Card>
          ) : (
            abgeschlosseneExperimente.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold">{exp.title}</h4>
                    <Badge className="bg-green-500 text-white">
                      {exp.status === 'scaled' ? 'Skaliert' : 'Umgesetzt'}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Beschreibung</p>
                    <p className="text-gray-700">{exp.description || 'Keine Beschreibung vorhanden'}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Kategorie</p>
                      <p className="font-medium">{exp.category || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Abteilung</p>
                      <p className="font-medium">{exp.department || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Eingereicht von</p>
                      <p className="font-medium">{exp.submitted_by_name || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Score</p>
                      <p className="font-medium">{exp.score || '–'}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Erfolgreich abgeschlossen</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Diese Idee wurde erfolgreich validiert und befindet sich nun in der {exp.status === 'scaled' ? 'Skalierungsphase' : 'Umsetzung'}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Experiment-Framework */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Experiment-Framework</h3>
        <div className="grid grid-cols-3 gap-4">
          {frameworkSteps.map((step) => (
            <Card key={step.step} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* KI-Empfehlungen */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">KI-Empfehlungen für Experimente</h3>
        </div>
        <div className="space-y-4">
          {experiments.length > 0 ? (
            <>
              <div>
                <span className="font-medium text-purple-900">Experiment-Potenzial</span>
                <p className="text-sm text-purple-700">Basierend auf den aktuellen Daten gibt es {laufendeExperimente.length} laufende Experimente. Prüfen Sie regelmäßig den Fortschritt.</p>
              </div>
              <div>
                <span className="font-medium text-purple-900">Erfolgsquote optimieren</span>
                <p className="text-sm text-purple-700">Die aktuelle Erfolgsquote liegt bei {experiments.length > 0 ? Math.round((abgeschlosseneExperimente.length / experiments.length) * 100) : 0}%. Fokussieren Sie auf Quick-Wins mit hohem Impact.</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-purple-700">Starten Sie Ihr erstes Experiment, um KI-basierte Empfehlungen zu erhalten.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnovationExperimenteTab;
