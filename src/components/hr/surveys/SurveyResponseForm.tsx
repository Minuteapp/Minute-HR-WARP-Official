
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
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

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  anonymous: boolean;
}

interface SurveyResponseFormProps {
  survey: Survey;
  onSubmit: () => void;
  onCancel: () => void;
}

export const SurveyResponseForm = ({ survey, onSubmit, onCancel }: SurveyResponseFormProps) => {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: any) => {
      const { data, error } = await supabase
        .from('hr_survey_responses')
        .insert([responseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Ihre Antworten wurden erfolgreich übermittelt');
      onSubmit();
    },
    onError: (error: any) => {
      console.error('Fehler beim Übermitteln der Antworten:', error);
      toast.error('Fehler beim Übermitteln der Antworten');
    }
  });

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    // Validierung der Pflichtfelder
    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id] || responses[q.id] === '');

    if (missingResponses.length > 0) {
      toast.error(`Bitte beantworten Sie alle Pflichtfelder (${missingResponses.length} fehlen)`);
      return;
    }

    const responseData = {
      survey_id: survey.id,
      responses: responses,
      is_anonymous: survey.anonymous
    };

    submitResponseMutation.mutate(responseData);
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Ihre Antwort hier eingeben..."
            className="w-full"
            rows={3}
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                className={`p-1 rounded ${
                  value >= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {value ? `${value}/5` : 'Noch nicht bewertet'}
            </span>
          </div>
        );

      case 'yes_no':
        return (
          <RadioGroup
            value={value}
            onValueChange={(value) => handleResponseChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`}>Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`}>Nein</Label>
            </div>
          </RadioGroup>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{survey.title}</CardTitle>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
          {survey.anonymous && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ℹ️ Diese Umfrage ist anonym. Ihre Antworten können nicht zu Ihnen zurückverfolgt werden.
              </p>
            </div>
          )}
        </CardHeader>
      </Card>

      {survey.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              Frage {index + 1}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            <div>
              <p className="font-medium">{question.title}</p>
              {question.description && (
                <p className="text-sm text-gray-600 mt-1">{question.description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderQuestion(question)}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Pflichtfelder sind mit * markiert</p>
              <p>
                Fortschritt: {Object.keys(responses).length} von {survey.questions.length} Fragen beantwortet
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitResponseMutation.isPending}
              >
                {submitResponseMutation.isPending ? 'Übermitteln...' : 'Antworten übermitteln'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
