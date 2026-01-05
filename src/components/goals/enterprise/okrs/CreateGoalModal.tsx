import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { KeyResultFormItem } from "./KeyResultFormItem";
import { useGoals } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";

interface KeyResult {
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  measurement_type: 'automatic' | 'manual';
}

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGoalModal = ({ open, onOpenChange }: CreateGoalModalProps) => {
  const { createGoal, isCreating } = useGoals();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_level: 'individual',
    goal_type: 'operational',
    owner_name: '',
    department_name: '',
    parent_goal_id: '',
    start_date: '',
    end_date: '',
  });

  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyResult = () => {
    setKeyResults(prev => [...prev, {
      title: '',
      target_value: 0,
      current_value: 0,
      unit: '',
      measurement_type: 'manual',
    }]);
  };

  const updateKeyResult = (index: number, field: string, value: string | number) => {
    setKeyResults(prev => prev.map((kr, i) => 
      i === index ? { ...kr, [field]: value } : kr
    ));
  };

  const removeKeyResult = (index: number) => {
    setKeyResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGoal({
        ...formData,
        progress: 0,
        status: 'on_track',
        risk_level: 'low',
        trend: 'stable',
      });
      
      setFormData({
        title: '',
        description: '',
        goal_level: 'individual',
        goal_type: 'operational',
        owner_name: '',
        department_name: '',
        parent_goal_id: '',
        start_date: '',
        end_date: '',
      });
      setKeyResults([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Ziel konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Ziel erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Zieltitel eingeben"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Beschreibung des Ziels"
              />
            </div>
            
            <div>
              <Label>Ebene *</Label>
              <Select 
                value={formData.goal_level} 
                onValueChange={(value) => handleChange('goal_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Unternehmen</SelectItem>
                  <SelectItem value="department">Bereich</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Typ *</Label>
              <Select 
                value={formData.goal_type} 
                onValueChange={(value) => handleChange('goal_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategic">Strategisch</SelectItem>
                  <SelectItem value="operational">Operativ</SelectItem>
                  <SelectItem value="project">Projektbezogen</SelectItem>
                  <SelectItem value="okr">OKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="owner_name">Owner *</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                placeholder="Verantwortlicher"
              />
            </div>
            
            <div>
              <Label htmlFor="department_name">Bereich</Label>
              <Input
                id="department_name"
                value={formData.department_name}
                onChange={(e) => handleChange('department_name', e.target.value)}
                placeholder="Bereichsname"
              />
            </div>
            
            <div>
              <Label htmlFor="start_date">Startdatum *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">Enddatum *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Results</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addKeyResult}
              >
                <Plus className="h-4 w-4 mr-1" />
                Key Result hinzufügen
              </Button>
            </div>
            
            {keyResults.map((kr, index) => (
              <KeyResultFormItem
                key={index}
                index={index}
                title={kr.title}
                targetValue={kr.target_value}
                currentValue={kr.current_value}
                unit={kr.unit}
                measurementType={kr.measurement_type}
                onChange={updateKeyResult}
                onRemove={removeKeyResult}
              />
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Wird erstellt...' : 'Ziel erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
