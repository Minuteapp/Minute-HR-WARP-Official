
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Lightbulb, Target, TrendingUp, 
  Calendar, AlertCircle, CheckCircle, Sparkles,
  BarChart3, Zap, Clock, Users
} from 'lucide-react';
import { Goal } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';
import { goalAIService, AIGoalSuggestion, AIAnalysisResult } from '@/services/goalAIService';

interface GoalAIAssistantProps {
  goal?: Goal;
  goals?: Goal[];
  context?: 'dashboard' | 'individual_goal' | 'goal_creation';
  onGoalUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onCreateGoal?: (goalData: Partial<Goal>) => void;
}

export const GoalAIAssistant: React.FC<GoalAIAssistantProps> = ({ 
  goal, 
  goals = [], 
  context = 'dashboard',
  onGoalUpdate,
  onCreateGoal
}) => {
  const [suggestions, setSuggestions] = useState<AIGoalSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      if (goal) {
        // Einzelziel-Analyse
        const result = await goalAIService.analyzeGoal(goal);
        setAnalysis(result);
        setSuggestions(result.suggestions);
      } else if (goals.length > 0) {
        // Portfolio-Analyse
        const result = await goalAIService.analyzeGoalPortfolio(goals);
        setAnalysis(result);
        setSuggestions(result.suggestions);
      } else {
        // Allgemeine Vorschläge
        const newSuggestions = await goalAIService.generateGoalSuggestions({
          category: 'personal'
        });
        setSuggestions(newSuggestions);
      }
      
      toast({
        title: "KI-Analyse abgeschlossen",
        description: "Die KI hat personalisierte Empfehlungen erstellt."
      });
    } catch (error) {
      toast({
        title: "Fehler bei der KI-Analyse",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomAIRequest = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const newSuggestions = await goalAIService.generateGoalSuggestions({
        category: 'personal',
        prompt: customPrompt,
        existingGoals: goals
      });
      
      setSuggestions(prev => [...newSuggestions, ...prev]);
      setCustomPrompt('');
      
      toast({
        title: "KI-Antwort generiert",
        description: "Neue Vorschläge basierend auf Ihrer Anfrage wurden erstellt."
      });
    } catch (error) {
      toast({
        title: "Fehler bei der Anfrage",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const optimizeGoalStructure = async () => {
    if (!goal) return;
    
    setIsGenerating(true);
    
    try {
      const optimizationSuggestions = await goalAIService.optimizeGoalStructure(goal);
      setSuggestions(prev => [...optimizationSuggestions, ...prev]);
      
      toast({
        title: "Optimierungsvorschläge generiert",
        description: "Die KI hat Verbesserungen für die Zielstruktur vorgeschlagen."
      });
    } catch (error) {
      toast({
        title: "Fehler bei der Optimierung",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = async (suggestion: AIGoalSuggestion) => {
    if (!suggestion.actionable || !suggestion.suggestedAction) return;

    try {
      const action = suggestion.suggestedAction;
      
      if (action.type === 'update_goal' && goal && onGoalUpdate) {
        if (action.data.addKPIs) {
          onGoalUpdate(goal.id, {
            kpi_target: '100',
            measurement_unit: 'Prozent'
          });
        }
      } else if (action.type === 'create_milestone' && onCreateGoal) {
        const milestoneData = action.data.template || {
          title: 'Neues Meilenstein-Ziel',
          category: 'personal' as const,
          priority: 'medium' as const,
          progress: 0,
          status: 'active' as const,
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: 'current_user'
        };
        onCreateGoal(milestoneData);
      }
      
      // Entferne angewendeten Vorschlag
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      toast({
        title: "Vorschlag angewendet",
        description: "Die empfohlene Aktion wurde ausgeführt."
      });
    } catch (error) {
      toast({
        title: "Fehler beim Anwenden",
        description: "Der Vorschlag konnte nicht angewendet werden.",
        variant: "destructive"
      });
    }
  };

  const getSuggestionIcon = (type: AIGoalSuggestion['type']) => {
    switch (type) {
      case 'goal_creation': return Target;
      case 'progress_tip': return TrendingUp;
      case 'deadline_reminder': return Calendar;
      case 'optimization': return Lightbulb;
      case 'milestone_creation': return CheckCircle;
      case 'kpi_suggestion': return BarChart3;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: AIGoalSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          KI-Assistent für Ziele
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Vorschläge</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
            <TabsTrigger value="chat">KI Chat</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={generateSuggestions} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Intelligente Analyse starten
                  </>
                )}
              </Button>

              {goal && (
                <Button 
                  variant="outline"
                  onClick={optimizeGoalStructure}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Zielstruktur optimieren
                </Button>
              )}
            </div>

            {/* KI-Vorschläge anzeigen */}
            <div className="space-y-3">
              {suggestions.length > 0 && (
                <h4 className="text-sm font-medium text-muted-foreground">KI-Empfehlungen</h4>
              )}
              
              {suggestions.map((suggestion) => {
                const Icon = getSuggestionIcon(suggestion.type);
                return (
                  <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-600" />
                        <h5 className="text-sm font-medium">{suggestion.title}</h5>
                      </div>
                      <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs">
                        {suggestion.priority === 'high' ? 'Hoch' : 
                         suggestion.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground ml-6">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.actionable && (
                      <div className="ml-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Anwenden
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Trend</span>
                    </div>
                    <Badge variant={analysis.insights.progressTrend === 'improving' ? 'default' : 'outline'}>
                      {analysis.insights.progressTrend === 'improving' ? 'Verbessernd' :
                       analysis.insights.progressTrend === 'declining' ? 'Abnehmend' : 'Stabil'}
                    </Badge>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Risiko</span>
                    </div>
                    <Badge variant={analysis.insights.riskLevel === 'high' ? 'destructive' : 'outline'}>
                      {analysis.insights.riskLevel === 'high' ? 'Hoch' :
                       analysis.insights.riskLevel === 'medium' ? 'Mittel' : 'Niedrig'}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Erfolgswahrscheinlichkeit</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(analysis.insights.completionProbability)}%
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2">KI-Empfehlungen</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.insights.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Starten Sie eine Analyse, um detaillierte Einblicke zu erhalten</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Fragen Sie die KI zu Ihren Zielen... (z.B. 'Wie kann ich mein Verkaufsziel effizienter erreichen?')"
                rows={3}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCustomAIRequest}
                disabled={isGenerating || !customPrompt.trim()}
                className="w-full"
              >
                <Brain className="h-4 w-4 mr-2" />
                KI fragen
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {suggestions.length === 0 && !analysis && (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Starten Sie eine KI-Analyse, um personalisierte Empfehlungen zu erhalten</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
