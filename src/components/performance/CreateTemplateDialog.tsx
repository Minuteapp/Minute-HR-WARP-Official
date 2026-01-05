
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useCreatePerformanceTemplate } from '@/hooks/usePerformance';
import type { 
  CreatePerformanceTemplateRequest, 
  PerformanceTemplateType, 
  PerformanceRatingScale,
  PerformanceCycleType,
  PerformanceEvaluationField,
  PerformanceCriteria
} from '@/types/performance';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateDialog = ({ open, onOpenChange }: CreateTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: 'individual' as PerformanceTemplateType,
    rating_scale: 'stars_5' as PerformanceRatingScale,
    cycle_type: 'quarterly' as PerformanceCycleType,
    requires_signature: false,
  });

  const [evaluationFields, setEvaluationFields] = useState<PerformanceEvaluationField[]>([
    {
      name: 'fachwissen',
      label: 'Fachwissen',
      type: 'rating',
      required: true,
      description: 'Bewertung der fachlichen Kompetenz'
    }
  ]);

  const [criteria, setCriteria] = useState<PerformanceCriteria[]>([
    {
      name: 'fachwissen',
      weight: 1.0,
      category: 'core'
    }
  ]);

  const createTemplate = useCreatePerformanceTemplate();

  const addEvaluationField = () => {
    setEvaluationFields(prev => [...prev, {
      name: '',
      label: '',
      type: 'rating',
      required: false,
      description: ''
    }]);
  };

  const removeEvaluationField = (index: number) => {
    setEvaluationFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateEvaluationField = (index: number, field: Partial<PerformanceEvaluationField>) => {
    setEvaluationFields(prev => prev.map((item, i) => 
      i === index ? { ...item, ...field } : item
    ));
  };

  const addCriteria = () => {
    setCriteria(prev => [...prev, {
      name: '',
      weight: 1.0,
      category: ''
    }]);
  };

  const removeCriteria = (index: number) => {
    setCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const updateCriteria = (index: number, criterion: Partial<PerformanceCriteria>) => {
    setCriteria(prev => prev.map((item, i) => 
      i === index ? { ...item, ...criterion } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || evaluationFields.length === 0) return;

    const templateData: CreatePerformanceTemplateRequest = {
      ...formData,
      evaluation_fields: evaluationFields.filter(field => field.name && field.label),
      criteria: criteria.filter(criterion => criterion.name)
    };

    try {
      await createTemplate.mutateAsync(templateData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        template_type: 'individual',
        rating_scale: 'stars_5',
        cycle_type: 'quarterly',
        requires_signature: false,
      });
      setEvaluationFields([{
        name: 'fachwissen',
        label: 'Fachwissen',
        type: 'rating',
        required: true,
        description: 'Bewertung der fachlichen Kompetenz'
      }]);
      setCriteria([{
        name: 'fachwissen',
        weight: 1.0,
        category: 'core'
      }]);

      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Templates:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Performance Template erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template-Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Jährliche Mitarbeiterbewertung"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschreibung des Templates..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template_type">Template-Typ</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value: PerformanceTemplateType) => 
                      setFormData(prev => ({ ...prev, template_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individuell</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="goal_based">Ziel-basiert</SelectItem>
                      <SelectItem value="feedback_360">360° Feedback</SelectItem>
                      <SelectItem value="ad_hoc">Ad-hoc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating_scale">Bewertungsskala</Label>
                  <Select
                    value={formData.rating_scale}
                    onValueChange={(value: PerformanceRatingScale) => 
                      setFormData(prev => ({ ...prev, rating_scale: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars_5">5 Sterne</SelectItem>
                      <SelectItem value="percentage">Prozent</SelectItem>
                      <SelectItem value="grade">Noten</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cycle_type">Bewertungszyklus</Label>
                  <Select
                    value={formData.cycle_type}
                    onValueChange={(value: PerformanceCycleType) => 
                      setFormData(prev => ({ ...prev, cycle_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="quarterly">Quartalsweise</SelectItem>
                      <SelectItem value="semi_annual">Halbjährlich</SelectItem>
                      <SelectItem value="annual">Jährlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="requires_signature"
                    checked={formData.requires_signature}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, requires_signature: checked }))
                    }
                  />
                  <Label htmlFor="requires_signature">Unterschrift erforderlich</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Fields */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Bewertungsfelder</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addEvaluationField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Feld hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluationFields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Bewertungsfeld {index + 1}</h4>
                    {evaluationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEvaluationField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Feldname</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateEvaluationField(index, { name: e.target.value })}
                        placeholder="z.B. fachwissen"
                      />
                    </div>
                    <div>
                      <Label>Anzeigetext</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateEvaluationField(index, { label: e.target.value })}
                        placeholder="z.B. Fachwissen"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Feldtyp</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateEvaluationField(index, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Bewertung</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Zahl</SelectItem>
                          <SelectItem value="select">Auswahl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) => updateEvaluationField(index, { required: checked })}
                      />
                      <Label>Pflichtfeld</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Beschreibung</Label>
                    <Textarea
                      value={field.description || ''}
                      onChange={(e) => updateEvaluationField(index, { description: e.target.value })}
                      placeholder="Beschreibung des Bewertungsfeldes..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Erstelle...' : 'Template erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
