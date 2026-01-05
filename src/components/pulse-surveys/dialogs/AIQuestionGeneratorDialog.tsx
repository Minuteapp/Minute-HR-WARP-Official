import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Lightbulb, CheckCircle, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePulseTemplates } from "@/hooks/usePulseTemplates";

interface AIQuestionGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsGenerated?: (questions: GeneratedQuestion[]) => void;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  category: string;
  type: string;
  rationale: string;
}

export const AIQuestionGeneratorDialog = ({ 
  open, 
  onOpenChange,
  onQuestionsGenerated 
}: AIQuestionGeneratorDialogProps) => {
  const [goal, setGoal] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const { templateSuggestions, saveTemplate, isSaving } = usePulseTemplates();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Calling pulse-survey-ai function with goal:', goal);
      
      const { data, error: functionError } = await supabase.functions.invoke('pulse-survey-ai', {
        body: { goal, type: 'generate-questions' }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Fehler beim Generieren der Fragen');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.questions || !Array.isArray(data.questions)) {
        console.error('Invalid response format:', data);
        throw new Error('Ungültiges Antwortformat von der KI');
      }

      console.log('Generated questions:', data.questions);
      setGeneratedQuestions(data.questions);
      setIsGenerated(true);
      toast.success(`${data.questions.length} Fragen erfolgreich generiert`);
      
    } catch (err) {
      console.error('Error generating questions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      toast.error(`Fehler: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Bitte geben Sie einen Namen für die Vorlage ein");
      return;
    }

    saveTemplate({
      name: templateName,
      description: goal,
      questions: generatedQuestions
    });

    onOpenChange(false);
    resetState();
  };

  const handleUseDirectly = () => {
    if (onQuestionsGenerated) {
      onQuestionsGenerated(generatedQuestions);
    }
    toast.success("Fragen zur Umfrage hinzugefügt");
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setGoal("");
    setSelectedTemplate(null);
    setIsGenerated(false);
    setGeneratedQuestions([]);
    setError(null);
    setTemplateName("");
    setShowSaveForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>KI-Fragenset-Generator</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Beschreiben Sie Ihr Ziel und lassen Sie die KI passende Fragen generieren
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Beschreiben Sie Ihr Umfrageziel</label>
            <Textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="z.B. 'Ich möchte Feedback zur Remote-Work-Kultur einholen, insbesondere zu Kommunikation, Teamzusammenhalt und technischer Ausstattung.'"
              className="min-h-[100px]"
            />
          </div>

          {/* Template Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Oder wählen Sie eine Vorlage</label>
            <div className="grid grid-cols-2 gap-2">
              {templateSuggestions.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className={selectedTemplate === template.id ? "bg-primary" : ""}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setGoal(`Fragen zum Thema ${template.label} generieren`);
                  }}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          {!isGenerated && (
            <Button
              onClick={handleGenerate}
              disabled={!goal.trim() || isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generiere Fragen mit KI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Fragen generieren
                </>
              )}
            </Button>
          )}

          {/* Generated Questions */}
          {isGenerated && generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Generierte Fragen ({generatedQuestions.length})</h3>
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Fertig
                </Badge>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {generatedQuestions.map((q, index) => (
                  <Card key={q.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium">{q.question}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {q.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {q.type}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-2 bg-yellow-50 p-2 rounded text-xs">
                            <Lightbulb className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-yellow-700">
                              <strong>KI-Rationale:</strong> {q.rationale}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="space-y-3 pt-4 border-t">
                {showSaveForm ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Name der Vorlage"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveAsTemplate}
                        disabled={isSaving || !templateName.trim()}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Speichern..." : "Speichern"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowSaveForm(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowSaveForm(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Als Vorlage speichern
                    </Button>
                    <Button onClick={handleUseDirectly} className="flex-1">
                      Direkt verwenden
                    </Button>
                  </div>
                )}
              </div>

              {/* Regenerate Button */}
              <Button
                onClick={() => {
                  setIsGenerated(false);
                  setGeneratedQuestions([]);
                }}
                variant="ghost"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Neue Fragen generieren
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
