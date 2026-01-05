
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCreateWorkforcePlan } from '@/hooks/useWorkforcePlanning';
import { useToast } from '@/hooks/use-toast';

interface CreateWorkforcePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkforcePlanDialog = ({ open, onOpenChange }: CreateWorkforcePlanDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'department' as any,
    scope_id: '',
    planning_horizon: '12_months' as any,
    start_date: '',
    end_date: '',
    budget_allocation: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createPlan } = useCreateWorkforcePlan();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createPlan(formData);
      toast({
        title: "Workforce Plan erstellt",
        description: "Ihr neuer Workforce Plan wurde erfolgreich erstellt.",
      });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        scope: 'department',
        scope_id: '',
        planning_horizon: '12_months',
        start_date: '',
        end_date: '',
        budget_allocation: 0
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Plan konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scopeOptions = [
    { value: 'global', label: 'Global (gesamtes Unternehmen)' },
    { value: 'region', label: 'Region (z.B. DACH, Europa)' },
    { value: 'country', label: 'Land (z.B. Deutschland)' },
    { value: 'location', label: 'Standort (z.B. Berlin)' },
    { value: 'department', label: 'Abteilung (z.B. Engineering)' },
    { value: 'team', label: 'Team (z.B. Frontend Team)' }
  ];

  const planningHorizonOptions = [
    { value: '12_months', label: '12 Monate', description: 'Kurzfristige Planung' },
    { value: '24_months', label: '24 Monate', description: 'Mittelfristige Planung' },
    { value: '36_months', label: '36 Monate', description: 'Langfristige Planung' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neuen Workforce Plan erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen strategischen Personalplan mit KI-gestützten Forecasts und Szenario-Planungen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Plan-Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Q2 2024 Engineering Expansion"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kurze Beschreibung des Plans und seiner Ziele..."
                rows={3}
              />
            </div>
          </div>

          {/* Scope Configuration */}
          <div className="space-y-4">
            <div>
              <Label>Planungsbereich *</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) => setFormData({ ...formData, scope: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bereich auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.scope && formData.scope !== 'global' && (
              <div>
                <Label htmlFor="scope_id">Spezifischer Bereich</Label>
                <Input
                  id="scope_id"
                  value={formData.scope_id}
                  onChange={(e) => setFormData({ ...formData, scope_id: e.target.value })}
                  placeholder={`${formData.scope === 'department' ? 'z.B. Engineering' : 'Bereichs-ID oder Name'}`}
                />
              </div>
            )}
          </div>

          {/* Planning Horizon */}
          <div>
            <Label>Planungshorizont *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {planningHorizonOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.planning_horizon === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, planning_horizon: option.value as any })}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Startdatum *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Enddatum *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget">Budget-Allocation (EUR)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget_allocation}
              onChange={(e) => setFormData({ ...formData, budget_allocation: Number(e.target.value) })}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optionales Budget für diesen Plan. Kann später angepasst werden.
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Plan-Vorschau:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{formData.scope || 'Nicht gewählt'}</Badge>
                <span>{formData.name || 'Unbenannt'}</span>
              </div>
              <div className="text-gray-600">
                Zeitraum: {formData.start_date || '—'} bis {formData.end_date || '—'}
              </div>
              <div className="text-gray-600">
                Horizont: {planningHorizonOptions.find(h => h.value === formData.planning_horizon)?.label || '—'}
              </div>
              {formData.budget_allocation > 0 && (
                <div className="text-gray-600">
                  Budget: €{formData.budget_allocation.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.start_date || !formData.end_date}>
              {isSubmitting ? 'Erstelle...' : 'Plan erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
