
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'yes_no';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
}

interface SurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: any;
}

export const SurveyDialog = ({ open, onOpenChange, survey }: SurveyDialogProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(survey?.title || '');
  const [description, setDescription] = useState(survey?.description || '');
  const [surveyType, setSurveyType] = useState(survey?.survey_type || 'general');
  const [anonymous, setAnonymous] = useState(survey?.anonymous ?? true);
  const [questions, setQuestions] = useState<Question[]>(survey?.questions || []);

  const createSurveyMutation = useMutation({
    mutationFn: async (surveyData: any) => {
      const { data, error } = await supabase
        .from('hr_surveys')
        .insert([surveyData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-surveys'] });
      toast.success('Umfrage wurde erfolgreich erstellt');
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Fehler beim Erstellen der Umfrage:', error);
      toast.error('Fehler beim Erstellen der Umfrage');
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSurveyType('general');
    setAnonymous(true);
    setQuestions([]);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'text',
      title: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options!.push('');
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    if (questions.length === 0) {
      toast.error('Bitte fügen Sie mindestens eine Frage hinzu');
      return;
    }

    const surveyData = {
      title: title.trim(),
      description: description.trim(),
      survey_type: surveyType,
      anonymous,
      questions,
      status: 'draft'
    };

    createSurveyMutation.mutate(surveyData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {survey ? 'Umfrage bearbeiten' : 'Neue Umfrage erstellen'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grundinformationen */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Umfrage-Titel eingeben..."
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibung der Umfrage..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="survey-type">Umfrage-Typ</Label>
                  <Select value={surveyType} onValueChange={setSurveyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Allgemein</SelectItem>
                      <SelectItem value="satisfaction">Zufriedenheit</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="evaluation">Bewertung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={anonymous}
                    onCheckedChange={setAnonymous}
                  />
                  <Label htmlFor="anonymous">Anonyme Umfrage</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fragen */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fragen</CardTitle>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Frage hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Frage {questionIndex + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fragentyp</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value: any) => updateQuestion(questionIndex, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="rating">Bewertung (1-5 Sterne)</SelectItem>
                              <SelectItem value="yes_no">Ja/Nein</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={question.required}
                            onCheckedChange={(checked) => updateQuestion(questionIndex, { required: checked })}
                          />
                          <Label>Pflichtfeld</Label>
                        </div>
                      </div>

                      <div>
                        <Label>Fragetitel</Label>
                        <Input
                          value={question.title}
                          onChange={(e) => updateQuestion(questionIndex, { title: e.target.value })}
                          placeholder="Frage eingeben..."
                        />
                      </div>

                      <div>
                        <Label>Beschreibung (optional)</Label>
                        <Input
                          value={question.description || ''}
                          onChange={(e) => updateQuestion(questionIndex, { description: e.target.value })}
                          placeholder="Zusätzliche Erklärung zur Frage..."
                        />
                      </div>

                      {/* Optionen für Multiple Choice */}
                      {question.type === 'multiple_choice' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Antwortoptionen</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(questionIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Option hinzufügen
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Noch keine Fragen hinzugefügt. Klicken Sie auf "Frage hinzufügen" um zu beginnen.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktionen */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createSurveyMutation.isPending}
            >
              {createSurveyMutation.isPending ? 'Erstellen...' : 'Umfrage erstellen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
