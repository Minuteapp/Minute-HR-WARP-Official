
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Target, Calendar, TrendingUp, Lightbulb } from 'lucide-react';
import { Goal, GoalCategory, GoalPriority } from '@/types/goals';
import { goalAIService } from '@/services/goalAIService';
import { useToast } from '@/hooks/use-toast';

interface AIGoalCreatorProps {
  category: GoalCategory;
  onCreateGoal: (goalData: Partial<Goal>) => void;
  onClose?: () => void;
}

export const AIGoalCreator: React.FC<AIGoalCreatorProps> = ({
  category,
  onCreateGoal,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedGoals, setGeneratedGoals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const { toast } = useToast();

  const generateGoalsFromPrompt = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const suggestions = await goalAIService.generateGoalSuggestions({
        category,
        prompt,
        existingGoals: []
      });

      // Konvertiere KI-Vorschläge zu Ziel-Templates
      const goalTemplates = suggestions.map((suggestion, index) => ({
        id: `ai_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        category,
        priority: suggestion.priority as GoalPriority,
        progress: 0,
        status: 'active' as const,
        start_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'current_user',
        kpi_target: suggestion.suggestedAction?.data?.template?.kpi_target || '',
        measurement_unit: suggestion.suggestedAction?.data?.template?.measurement_unit || '',
        auto_reminders: true,
        reminder_frequency: 'weekly' as const
      }));

      setGeneratedGoals(goalTemplates);
      
      toast({
        title: "Ziele generiert",
        description: `${goalTemplates.length} KI-generierte Zielvorschläge erstellt.`
      });
    } catch (error) {
      toast({
        title: "Fehler bei der Generierung",
        description: "Ziele konnten nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectGoal = (goal: any) => {
    setSelectedGoal(goal);
  };

  const customizeAndCreate = () => {
    if (!selectedGoal) return;

    onCreateGoal(selectedGoal);
    onClose?.();
    
    toast({
      title: "Ziel erstellt",
      description: "Das KI-generierte Ziel wurde erfolgreich erstellt."
    });
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryLabel = (cat: GoalCategory) => {
    switch (cat) {
      case 'personal': return 'Persönlich';
      case 'team': return 'Team';
      case 'company': return 'Unternehmen';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            KI-Ziel-Generator
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Beschreiben Sie Ihr gewünschtes Ziel</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Beispiel: "Ich möchte meine ${getCategoryLabel(category).toLowerCase()}en Fähigkeiten in der Kommunikation verbessern"`}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Kategorie: {getCategoryLabel(category)}</Badge>
          </div>

          <Button 
            onClick={generateGoalsFromPrompt}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Generiere Ziele...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                KI-Ziele generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Generierte Zielvorschläge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedGoals.map((goal) => (
              <div 
                key={goal.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedGoal?.id === goal.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => selectGoal(goal)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{goal.title}</h4>
                  <Badge variant={getPriorityColor(goal.priority)}>
                    {goal.priority === 'high' ? 'Hoch' : 
                     goal.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {goal.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    30 Tage Ziel
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {goal.measurement_unit || 'Qualitativ'}
                  </div>
                </div>
              </div>
            ))}

            {selectedGoal && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Ausgewähltes Ziel anpassen</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Titel</label>
                    <Input
                      value={selectedGoal.title}
                      onChange={(e) => setSelectedGoal({...selectedGoal, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground">Beschreibung</label>
                    <Textarea
                      value={selectedGoal.description}
                      onChange={(e) => setSelectedGoal({...selectedGoal, description: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Priorität</label>
                      <Select 
                        value={selectedGoal.priority} 
                        onValueChange={(value) => setSelectedGoal({...selectedGoal, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niedrig</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground">Messeinheit</label>
                      <Input
                        value={selectedGoal.measurement_unit || ''}
                        onChange={(e) => setSelectedGoal({...selectedGoal, measurement_unit: e.target.value})}
                        placeholder="z.B. Stunden, Prozent"
                      />
                    </div>
                  </div>

                  <Button onClick={customizeAndCreate} className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Ziel erstellen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
