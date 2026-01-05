import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Heart, 
  BarChart3, 
  CheckCircle,
  Database,
  Layers,
  FileText,
  Edit,
  Save
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ExampleQuery {
  query: string;
  category: string;
  categoryColor: string;
}

interface AIAnalysisResult {
  confidence: number;
  dataSources: string[];
  groupings: string[];
  suggestedKPIs: string[];
}

const AIReportBuilderTab = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const { toast } = useToast();

  const exampleQueries: ExampleQuery[] = [
    {
      query: 'Zeige mir alle Mitarbeiter mit mehr als 15 Überstunden im letzten Monat',
      category: 'Zeit & Abwesenheit',
      categoryColor: 'bg-blue-100 text-blue-700'
    },
    {
      query: 'Welche Abteilungen haben die höchste Fluktuation in Q2 2024?',
      category: 'HR-Analyse',
      categoryColor: 'bg-purple-100 text-purple-700'
    },
    {
      query: 'Vergleiche Personalkosten nach Standort für das erste Halbjahr',
      category: 'Finance',
      categoryColor: 'bg-green-100 text-green-700'
    },
    {
      query: 'Erstelle einen Bericht über Krankenstandsquoten nach Team',
      category: 'Gesundheit',
      categoryColor: 'bg-red-100 text-red-700'
    }
  ];

  const aiSuggestions = [
    {
      title: 'Executive Dashboard',
      description: 'Übersicht aller wichtigen HR-KPIs für die Geschäftsführung',
      icon: BarChart3
    },
    {
      title: 'Strategische HR-Kennzahlen',
      description: 'Fluktuation, Headcount-Entwicklung und Recruiting-Effizienz',
      icon: TrendingUp
    },
    {
      title: 'Kosten-Nutzen-Analyse',
      description: 'Personalkosten im Verhältnis zu Produktivität und Output',
      icon: DollarSign
    }
  ];

  const steps = [
    { number: 1, title: 'Anfrage stellen', description: 'Beschreiben Sie in natürlicher Sprache, welchen Bericht Sie benötigen' },
    { number: 2, title: 'KI analysiert', description: 'Die KI identifiziert relevante Datenquellen und Metriken' },
    { number: 3, title: 'Bericht erstellen', description: 'Automatische Konfiguration basierend auf Ihrer Anfrage' },
    { number: 4, title: 'Übernehmen', description: 'Bericht ausführen oder manuell anpassen' }
  ];

  const handleCreateReport = async () => {
    if (!query.trim()) {
      toast({
        title: 'Eingabe erforderlich',
        description: 'Bitte beschreiben Sie, welchen Bericht Sie erstellen möchten.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine data sources based on query keywords
    const queryLower = query.toLowerCase();
    const dataSources: string[] = [];
    const groupings: string[] = [];
    const suggestedKPIs: string[] = [];

    if (queryLower.includes('mitarbeiter') || queryLower.includes('personal')) {
      dataSources.push('employees');
      groupings.push('department');
      suggestedKPIs.push('Mitarbeiteranzahl');
    }
    if (queryLower.includes('überstunden') || queryLower.includes('zeit')) {
      dataSources.push('time_entries');
      groupings.push('employee');
      suggestedKPIs.push('Gesamtstunden', 'Überstunden');
    }
    if (queryLower.includes('abwesenheit') || queryLower.includes('urlaub') || queryLower.includes('krank')) {
      dataSources.push('absence_requests');
      dataSources.push('sick_leaves');
      groupings.push('absence_type');
      suggestedKPIs.push('Abwesenheitstage', 'Krankenstandsquote');
    }
    if (queryLower.includes('abteilung') || queryLower.includes('team')) {
      groupings.push('department');
    }
    if (queryLower.includes('standort') || queryLower.includes('location')) {
      groupings.push('location');
    }
    if (queryLower.includes('fluktuation')) {
      dataSources.push('employees');
      suggestedKPIs.push('Fluktuationsrate', 'Abgänge', 'Neueinstellungen');
    }
    if (queryLower.includes('performance') || queryLower.includes('leistung')) {
      dataSources.push('performance_reviews');
      suggestedKPIs.push('Durchschnittliche Bewertung', 'Zielerreichung');
    }
    if (queryLower.includes('kosten') || queryLower.includes('gehalt')) {
      suggestedKPIs.push('Personalkosten', 'Kosten pro Mitarbeiter');
    }
    if (queryLower.includes('recruiting') || queryLower.includes('bewerbung')) {
      dataSources.push('job_applications');
      suggestedKPIs.push('Time-to-Hire', 'Bewerbungen', 'Einstellungsquote');
    }

    // Default values if nothing matched
    if (dataSources.length === 0) dataSources.push('employees');
    if (groupings.length === 0) groupings.push('department');
    if (suggestedKPIs.length === 0) suggestedKPIs.push('Anzahl', 'Durchschnitt');

    // Remove duplicates
    const uniqueDataSources = [...new Set(dataSources)];
    const uniqueGroupings = [...new Set(groupings)];
    const uniqueKPIs = [...new Set(suggestedKPIs)];

    setAnalysisResult({
      confidence: 85, // Fester Wert statt Zufallswert
      dataSources: uniqueDataSources,
      groupings: uniqueGroupings,
      suggestedKPIs: uniqueKPIs
    });

    setIsAnalyzing(false);
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    setAnalysisResult(null);
  };

  const handleSuggestionCreate = (title: string) => {
    setQuery(`Erstelle ein ${title} mit allen relevanten KPIs und Trends`);
    setAnalysisResult(null);
  };

  const handleExecuteReport = () => {
    toast({
      title: 'Bericht wird erstellt',
      description: 'Der Bericht wird basierend auf Ihrer Konfiguration generiert.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-violet-900">KI-gestützter Report Builder</h2>
              <p className="text-violet-700 mt-1">
                Beschreiben Sie in natürlicher Sprache, welchen Bericht Sie benötigen. Die KI analysiert Ihre Anfrage 
                und konfiguriert automatisch die passenden Datenquellen, Filter und Visualisierungen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Was möchten Sie analysieren?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="z.B. 'Zeige mir alle Mitarbeiter mit mehr als 15 Überstunden im letzten Monat' oder 'Welche Abteilungen haben die höchste Fluktuation?'"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAnalysisResult(null);
            }}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleCreateReport} 
            disabled={isAnalyzing || !query.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                KI analysiert...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Bericht erstellen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {analysisResult && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 space-y-6">
            {/* Success Banner */}
            <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Bericht erfolgreich erstellt</span>
            </div>

            {/* Query Display */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ihre Anfrage:</p>
              <p className="font-medium">{query}</p>
            </div>

            {/* AI Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                KI-Analyse
              </h3>

              {/* Confidence */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Konfidenz</span>
                  <span className="font-medium">{analysisResult.confidence}%</span>
                </div>
                <Progress value={analysisResult.confidence} className="h-2" />
              </div>

              {/* Data Sources */}
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Datenquellen
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.dataSources.map((source) => (
                    <Badge key={source} variant="secondary" className="bg-blue-100 text-blue-700">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Groupings */}
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Gruppierung
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.groupings.map((grouping) => (
                    <Badge key={grouping} variant="secondary" className="bg-purple-100 text-purple-700">
                      {grouping}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggested KPIs */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Vorgeschlagene KPIs</p>
                <div className="space-y-1">
                  {analysisResult.suggestedKPIs.map((kpi) => (
                    <div key={kpi} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{kpi}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={handleExecuteReport} className="bg-violet-600 hover:bg-violet-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Bericht übernehmen & ausführen
              </Button>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Als Vorlage speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Queries */}
      {!analysisResult && (
        <div className="space-y-4">
          <h3 className="font-semibold">Beispiel-Anfragen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exampleQueries.map((example, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:border-violet-300 transition-colors"
                onClick={() => handleExampleClick(example.query)}
              >
                <CardContent className="p-4">
                  <Badge className={`${example.categoryColor} mb-2`}>
                    {example.category}
                  </Badge>
                  <p className="text-sm">{example.query}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {!analysisResult && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">KI-Vorschläge für Ihre Rolle</h3>
            <p className="text-sm text-muted-foreground">
              Basierend auf Ihrer Rolle (Management) empfiehlt die KI folgende Berichte:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        <Icon className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-2 text-violet-600"
                          onClick={() => handleSuggestionCreate(suggestion.title)}
                        >
                          Erstellen →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* How It Works */}
      {!analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>So funktioniert's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-between gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center max-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg mb-3">
                    {step.number}
                  </div>
                  <h4 className="font-medium mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIReportBuilderTab;
