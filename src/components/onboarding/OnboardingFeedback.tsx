
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare } from 'lucide-react';
import { useEnhancedOnboarding } from '@/hooks/useEnhancedOnboarding';
import { Feedback } from '@/hooks/useEnhancedOnboarding';

interface OnboardingFeedbackProps {
  processId: string;
}

const OnboardingFeedback = ({ processId }: OnboardingFeedbackProps) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { submitFeedback, updateGamificationScore } = useEnhancedOnboarding();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Bewertung erforderlich",
        description: "Bitte geben Sie eine Bewertung ab, bevor Sie das Feedback senden.",
        variant: "destructive",
      });
      return;
    }
    
    if (!feedbackText.trim()) {
      toast({
        title: "Feedback erforderlich",
        description: "Bitte geben Sie einen Feedback-Text ein, bevor Sie das Feedback senden.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Feedback einreichen
      await submitFeedback({
        from: 'Mitarbeiter',
        message: feedbackText,
        rating: rating,
        type: 'self'
      });
      
      // Gamification-Score aktualisieren
      await updateGamificationScore(processId, 20);
      
      toast({
        title: "Feedback gesendet",
        description: "Vielen Dank für Ihr Feedback!",
      });
      
      // Formular zurücksetzen
      setFeedbackText('');
      setRating(0);
    } catch (error) {
      console.error('Fehler beim Senden des Feedbacks:', error);
      toast({
        title: "Fehler",
        description: "Beim Senden des Feedbacks ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Onboarding-Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rating">Wie würden Sie Ihren Onboarding-Prozess bewerten?</Label>
            <RadioGroup 
              value={rating.toString()} 
              onValueChange={(value) => setRating(parseInt(value))}
              className="flex space-x-4 py-2"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex flex-col items-center gap-2">
                  <RadioGroupItem value={value.toString()} id={`rating-${value}`} />
                  <Label htmlFor={`rating-${value}`}>{value}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Ihr Feedback zum Onboarding-Prozess</Label>
            <Textarea 
              id="feedback"
              placeholder="Teilen Sie Ihre Erfahrungen, Anregungen und Verbesserungsvorschläge mit uns..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Wird gesendet...' : 'Feedback senden'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OnboardingFeedback;
