import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Target, X } from "lucide-react";
import { useState } from "react";
import { GoalFormData, ProjectFormData } from "@/hooks/projects/types";

interface GoalsSectionProps {
  formData: ProjectFormData;
  onChange: (field: string, value: any) => void;
}

export const GoalsSection = ({ formData, onChange }: GoalsSectionProps) => {
  const [newGoal, setNewGoal] = useState<GoalFormData>({
    title: '',
    description: '',
    target: ''
  });

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goals = formData.goals || [];
      onChange('goals', [...goals, { ...newGoal, id: Date.now().toString() }]);
      setNewGoal({ title: '', description: '', target: '' });
    }
  };

  const removeGoal = (index: number) => {
    const goals = formData.goals || [];
    const updatedGoals = goals.filter((_, i) => i !== index);
    onChange('goals', updatedGoals);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-medium">Projektziele</h3>
      </div>

      {/* Existing Goals */}
      <div className="space-y-3">
        {(formData.goals || []).map((goal: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">{goal.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGoal(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600">{goal.description}</p>
            )}
            {goal.target && (
              <p className="text-sm font-medium text-green-600">Ziel: {goal.target}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add New Goal */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-4">Neues Ziel hinzufügen</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="goal-title">Zieltitel</Label>
            <Input
              id="goal-title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Zieltitel eingeben"
            />
          </div>
          <div>
            <Label htmlFor="goal-description">Beschreibung</Label>
            <Textarea
              id="goal-description"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Zielbeschreibung eingeben"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="goal-target">Zielwert/Kennzahl</Label>
            <Input
              id="goal-target"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              placeholder="z.B. 100% Fertigstellung, 50.000€ Umsatz"
            />
          </div>
          <Button 
            onClick={addGoal} 
            disabled={!newGoal.title.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ziel hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
};
