
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Clock, Goal, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEnhancedOnboarding } from '@/hooks/useEnhancedOnboarding';

interface OnboardingGoalsProps {
  processId: string;
}

const OnboardingGoals = ({ processId }: OnboardingGoalsProps) => {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { onboardingGoals, loadingGoals, createGoal, updateGoal, updateGamificationScore } = useEnhancedOnboarding();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalTitle.trim()) {
      toast({
        title: "Titel erforderlich",
        description: "Bitte geben Sie einen Titel für das Ziel ein.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createGoal({
        title: goalTitle,
        description: goalDescription,
        status: 'pending',
        dueDate: dueDate
      });
      
      await updateGamificationScore(processId, 10);
      
      toast({
        title: "Ziel erstellt",
        description: "Ihr Onboarding-Ziel wurde erfolgreich erstellt.",
      });
      
      // Formular zurücksetzen
      setGoalTitle('');
      setGoalDescription('');
      setDueDate('');
    } catch (error) {
      console.error('Fehler beim Erstellen des Ziels:', error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Ziels ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateGoal(goalId, { status: 'completed' });
      
      await updateGamificationScore(processId, 25);
      
      toast({
        title: "Ziel abgeschlossen",
        description: "Herzlichen Glückwunsch zum Erreichen Ihres Ziels!",
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Zielstatus:', error);
      toast({
        title: "Fehler",
        description: "Beim Abschließen des Ziels ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Goal className="h-5 w-5 text-primary" />
          Onboarding-Ziele
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Ziele-Liste */}
          {loadingGoals ? (
            <div className="text-center py-6">Ziele werden geladen...</div>
          ) : onboardingGoals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Noch keine Ziele definiert. Erstellen Sie unten Ihr erstes Onboarding-Ziel.
            </div>
          ) : (
            <div className="space-y-4">
              {onboardingGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {goal.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                      )}
                      {goal.dueDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Fällig bis: {new Date(goal.dueDate).toLocaleDateString('de-DE')}
                        </p>
                      )}
                    </div>
                    {goal.status !== 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCompleteGoal(goal.id)}
                      >
                        Abschließen
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Neues Ziel Formular */}
          <form onSubmit={handleSubmit} className="border-t pt-6 mt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Neues Ziel hinzufügen
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-title">Titel</Label>
                <Input
                  id="goal-title"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Titel des Ziels"
                />
              </div>
              <div>
                <Label htmlFor="goal-description">Beschreibung (optional)</Label>
                <Input
                  id="goal-description"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Beschreibung des Ziels"
                />
              </div>
              <div>
                <Label htmlFor="goal-date">Fälligkeitsdatum (optional)</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Ziel hinzufügen</Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingGoals;
