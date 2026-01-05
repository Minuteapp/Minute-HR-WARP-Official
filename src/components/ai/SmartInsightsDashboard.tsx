import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Zap,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Target,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmartInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  category: 'hr' | 'projects' | 'finance' | 'productivity' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: any;
  actionRequired: boolean;
  timestamp: Date;
}

const SmartInsightsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    generateInitialInsights();
    
    // Auto-refresh insights every 5 minutes
    const interval = setInterval(generateSmartInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const generateInitialInsights = async () => {
    // Keine Demo-Daten - Insights werden aus der Datenbank geladen
    setInsights([]);
  };

  const generateSmartInsights = async () => {
    setIsGenerating(true);
    
    try {
      // Call OpenAI to generate insights based on system data
      const response = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          modules: ['employees', 'projects', 'time_entries', 'absence_requests'],
          timeframe: '30d'
        }
      });

      if (response.data?.insights) {
        const newInsights = response.data.insights.map((insight: any, index: number) => ({
          id: `ai_${Date.now()}_${index}`,
          ...insight,
          timestamp: new Date()
        }));
        
        setInsights(prev => [...newInsights, ...prev].slice(0, 20)); // Keep latest 20
        
        toast({
          title: "🧠 KI-Insights aktualisiert",
          description: `${newInsights.length} neue Erkenntnisse generiert`,
        });
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Fehler bei KI-Analyse",
        description: "Insights konnten nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredInsights = activeCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === activeCategory);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return <Users className="h-4 w-4" />;
      case 'projects': return <BarChart3 className="h-4 w-4" />;
      case 'finance': return <DollarSign className="h-4 w-4" />;
      case 'productivity': return <Zap className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 text-white rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Smart Insights Dashboard</h2>
            <p className="text-gray-600">KI-gestützte Unternehmensanalysen in Echtzeit</p>
          </div>
        </div>
        <Button 
          onClick={generateSmartInsights}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generiere...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Insights aktualisieren
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Insights</p>
                <p className="text-2xl font-bold text-blue-600">{insights.length}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hohe Priorität</p>
                <p className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.impact === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktion erforderlich</p>
                <p className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => i.actionRequired).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ø Konfidenz</p>
                <p className="text-2xl font-bold text-green-600">
                  {insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights by Category */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="hr" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            HR
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            Projekte
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Finanzen
          </TabsTrigger>
          <TabsTrigger value="productivity" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Produktivität
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Risiken
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className={`
                ${insight.actionRequired ? 'border-l-4 border-l-red-500' : ''}
                ${insight.impact === 'high' ? 'bg-red-50' : insight.impact === 'medium' ? 'bg-yellow-50' : 'bg-green-50'}
              `}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                      {getCategoryIcon(insight.category)}
                      <Badge variant="secondary" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                        {insight.impact}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% sicher
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  {/* Data Visualization */}
                  {insight.data && (
                    <div className="p-3 bg-white rounded-lg border mb-4">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(insight.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {insight.timestamp.toLocaleString('de-DE')}
                    </span>
                    {insight.actionRequired && (
                      <Button size="sm" variant="outline">
                        <Target className="h-3 w-3 mr-1" />
                        Aktion planen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInsights.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Keine Insights in dieser Kategorie
                </h3>
                <p className="text-gray-500">
                  Aktualisieren Sie die Analyse, um neue Erkenntnisse zu generieren.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartInsightsDashboard;