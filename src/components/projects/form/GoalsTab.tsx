
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';

interface GoalsTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const GoalsTab = ({ 
  formData, 
  onChange, 
  onBack, 
  onNext,
  active, 
  forceMount = false,
  mode 
}: GoalsTabProps) => {
  const handleAddGoal = () => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: '',
      description: '',
      target: '',
      priority: 'medium',
      deadline: '',
      kpis: []
    };
    const updatedGoals = [...(formData.goals || []), newGoal];
    onChange('goals', updatedGoals);
  };

  const handleRemoveGoal = (goalId: string) => {
    const updatedGoals = (formData.goals || []).filter((goal: any) => goal.id !== goalId);
    onChange('goals', updatedGoals);
  };

  const handleGoalChange = (goalId: string, field: string, value: any) => {
    const updatedGoals = (formData.goals || []).map((goal: any) => 
      goal.id === goalId ? { ...goal, [field]: value } : goal
    );
    onChange('goals', updatedGoals);
  };

  return (
    <TabsContent value="goals" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projektziele & KPIs
            </h3>
            <p className="text-sm text-gray-500">Definieren Sie messbare Ziele für Ihr Projekt</p>
          </div>
          <Button onClick={handleAddGoal} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ziel hinzufügen
          </Button>
        </div>

        <div className="space-y-4">
          {(formData.goals || []).map((goal: any, index: number) => (
            <Card key={goal.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Ziel {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGoal(goal.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ziel-Titel *</Label>
                    <Input
                      value={goal.title}
                      onChange={(e) => handleGoalChange(goal.id, 'title', e.target.value)}
                      placeholder="Ziel-Titel eingeben"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priorität</Label>
                    <Select 
                      value={goal.priority} 
                      onValueChange={(value) => handleGoalChange(goal.id, 'priority', value)}
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
                </div>

                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={goal.description}
                    onChange={(e) => handleGoalChange(goal.id, 'description', e.target.value)}
                    placeholder="Detaillierte Beschreibung des Ziels"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Zielwert</Label>
                    <Input
                      value={goal.target}
                      onChange={(e) => handleGoalChange(goal.id, 'target', e.target.value)}
                      placeholder="z.B. 10.000 €, 50%, 100 Einheiten"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frist</Label>
                    <Input
                      type="date"
                      value={goal.deadline}
                      onChange={(e) => handleGoalChange(goal.id, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!formData.goals || formData.goals.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Ziele definiert</p>
              <p className="text-sm">Klicken Sie auf "Ziel hinzufügen" um zu beginnen</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button onClick={onNext}>
            Weiter
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
