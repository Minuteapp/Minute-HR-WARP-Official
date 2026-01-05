import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, type GoalFormData } from '@/lib/validations/priority2Schemas';
import { EmployeeGoal } from '@/hooks/employee-tabs/useEmployeeGoals';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  goal?: EmployeeGoal;
  mode: 'create' | 'edit';
}

export const GoalDialog = ({ open, onOpenChange, onSubmit, goal, mode }: GoalDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal ? {
      goal_title: goal.goal_title,
      description: goal.description || '',
      category: goal.category,
      type: goal.type,
      target_value: goal.target_value || undefined,
      unit: goal.unit || '',
      target_date: goal.target_date || '',
      priority: goal.priority,
    } : {
      category: 'personal',
      type: 'general',
      priority: 'medium',
    }
  });

  const handleFormSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neues Ziel erstellen' : 'Ziel bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="goal_title">Ziel-Titel *</Label>
            <Input id="goal_title" {...register('goal_title')} />
            {errors.goal_title && (
              <p className="text-sm text-destructive mt-1">{errors.goal_title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select 
                value={watch('category')} 
                onValueChange={(value: any) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Persönlich</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="company">Unternehmen</SelectItem>
                  <SelectItem value="skill">Kompetenz</SelectItem>
                  <SelectItem value="performance">Leistung</SelectItem>
                  <SelectItem value="development">Entwicklung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Typ</Label>
              <Select 
                value={watch('type')} 
                onValueChange={(value: any) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="okr">OKR</SelectItem>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="smart">SMART</SelectItem>
                  <SelectItem value="general">Allgemein</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="target_value">Zielwert</Label>
              <Input 
                id="target_value" 
                type="number" 
                step="0.01"
                {...register('target_value', { valueAsNumber: true })} 
              />
            </div>

            <div>
              <Label htmlFor="unit">Einheit</Label>
              <Input id="unit" {...register('unit')} placeholder="z.B. %, Stunden, €" />
            </div>

            <div>
              <Label htmlFor="priority">Priorität</Label>
              <Select 
                value={watch('priority')} 
                onValueChange={(value: any) => setValue('priority', value)}
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

          <div>
            <Label htmlFor="target_date">Zieldatum</Label>
            <Input id="target_date" type="date" {...register('target_date')} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : mode === 'create' ? 'Erstellen' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
