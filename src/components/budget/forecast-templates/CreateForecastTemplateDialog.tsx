
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useCreateForecastTemplate } from '@/hooks/useForecastTemplates';
import type { CreateForecastTemplateRequest, ForecastCategory, ForecastParameter, ForecastScenario, ForecastFormula } from '@/types/forecastTemplates';

interface CreateForecastTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateForecastTemplateDialog = ({ open, onOpenChange }: CreateForecastTemplateDialogProps) => {
  const [formData, setFormData] = useState<CreateForecastTemplateRequest>({
    name: '',
    description: '',
    category: 'budget',
    forecast_type: 'monthly',
    department: '',
    template_data: {
      structure: [
        {
          id: '1',
          name: 'Einnahmen',
          type: 'income',
          subcategories: [
            { id: '1-1', name: 'Verkaufserlöse', base_amount: 0, growth_rate: 5 },
            { id: '1-2', name: 'Sonstige Erlöse', base_amount: 0, growth_rate: 2 }
          ]
        },
        {
          id: '2',
          name: 'Ausgaben',
          type: 'expense',
          subcategories: [
            { id: '2-1', name: 'Personalkosten', base_amount: 0, growth_rate: 3 },
            { id: '2-2', name: 'Materialkosten', base_amount: 0, growth_rate: 2 },
            { id: '2-3', name: 'Verwaltungskosten', base_amount: 0, growth_rate: 1 }
          ]
        }
      ],
      parameters: [
        { key: 'inflation_rate', label: 'Inflationsrate (%)', type: 'percentage', default_value: 2.5, min_value: 0, max_value: 10, description: 'Jährliche Inflationsrate' },
        { key: 'growth_factor', label: 'Wachstumsfaktor', type: 'factor', default_value: 1.05, min_value: 0.8, max_value: 2.0, description: 'Allgemeiner Wachstumsfaktor' }
      ],
      scenarios: [
        {
          id: 'optimistic',
          name: 'Optimistisch',
          description: 'Beste realistische Entwicklung',
          multipliers: { revenue: 1.2, costs: 0.9 },
          adjustments: []
        },
        {
          id: 'realistic',
          name: 'Realistisch',
          description: 'Wahrscheinlichste Entwicklung',
          multipliers: { revenue: 1.0, costs: 1.0 },
          adjustments: []
        },
        {
          id: 'pessimistic',
          name: 'Pessimistisch',
          description: 'Konservative Schätzung',
          multipliers: { revenue: 0.8, costs: 1.1 },
          adjustments: []
        }
      ],
      formulas: [
        {
          id: 'ebitda',
          name: 'EBITDA',
          expression: 'Einnahmen - Ausgaben',
          variables: ['Einnahmen', 'Ausgaben'],
          description: 'Earnings Before Interest, Taxes, Depreciation and Amortization'
        }
      ]
    }
  });

  const createTemplate = useCreateForecastTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.forecast_type) {
      return;
    }

    try {
      await createTemplate.mutateAsync(formData);
      onOpenChange(false);
      // Reset form to default structure
      setFormData({
        name: '',
        description: '',
        category: 'budget',
        forecast_type: 'monthly',
        department: '',
        template_data: {
          structure: [
            {
              id: '1',
              name: 'Einnahmen',
              type: 'income',
              subcategories: [
                { id: '1-1', name: 'Verkaufserlöse', base_amount: 0, growth_rate: 5 },
                { id: '1-2', name: 'Sonstige Erlöse', base_amount: 0, growth_rate: 2 }
              ]
            },
            {
              id: '2',
              name: 'Ausgaben',
              type: 'expense',
              subcategories: [
                { id: '2-1', name: 'Personalkosten', base_amount: 0, growth_rate: 3 },
                { id: '2-2', name: 'Materialkosten', base_amount: 0, growth_rate: 2 },
                { id: '2-3', name: 'Verwaltungskosten', base_amount: 0, growth_rate: 1 }
              ]
            }
          ],
          parameters: [
            { key: 'inflation_rate', label: 'Inflationsrate (%)', type: 'percentage', default_value: 2.5, min_value: 0, max_value: 10, description: 'Jährliche Inflationsrate' },
            { key: 'growth_factor', label: 'Wachstumsfaktor', type: 'factor', default_value: 1.05, min_value: 0.8, max_value: 2.0, description: 'Allgemeiner Wachstumsfaktor' }
          ],
          scenarios: [
            {
              id: 'optimistic',
              name: 'Optimistisch',
              description: 'Beste realistische Entwicklung',
              multipliers: { revenue: 1.2, costs: 0.9 },
              adjustments: []
            },
            {
              id: 'realistic',
              name: 'Realistisch',
              description: 'Wahrscheinlichste Entwicklung',
              multipliers: { revenue: 1.0, costs: 1.0 },
              adjustments: []
            },
            {
              id: 'pessimistic',
              name: 'Pessimistisch',
              description: 'Konservative Schätzung',
              multipliers: { revenue: 0.8, costs: 1.1 },
              adjustments: []
            }
          ],
          formulas: [
            {
              id: 'ebitda',
              name: 'EBITDA',
              expression: 'Einnahmen - Ausgaben',
              variables: ['Einnahmen', 'Ausgaben'],
              description: 'Earnings Before Interest, Taxes, Depreciation and Amortization'
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const addCategory = () => {
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        structure: [
          ...prev.template_data.structure,
          {
            id: newId,
            name: '',
            type: 'expense',
            subcategories: []
          }
        ]
      }
    }));
  };

  const removeCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        structure: prev.template_data.structure.filter(cat => cat.id !== categoryId)
      }
    }));
  };

  const addParameter = () => {
    const newKey = `param_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        parameters: [
          ...prev.template_data.parameters,
          {
            key: newKey,
            label: '',
            type: 'percentage',
            default_value: 0
          }
        ]
      }
    }));
  };

  const addScenario = () => {
    const newId = `scenario_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenarios: [
          ...prev.template_data.scenarios,
          {
            id: newId,
            name: '',
            description: '',
            multipliers: {},
            adjustments: []
          }
        ]
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Forecast-Vorlage erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name der Vorlage *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Standard Budget-Planung Q1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget-Planung</SelectItem>
                  <SelectItem value="personnel">Personalkosten</SelectItem>
                  <SelectItem value="project">Projektkosten</SelectItem>
                  <SelectItem value="growth">Wachstums-Szenarien</SelectItem>
                  <SelectItem value="crisis">Krisen-Simulation</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung der Vorlage..."
              rows={2}
            />
          </div>

          {/* Detailed Configuration */}
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="structure">Struktur</TabsTrigger>
              <TabsTrigger value="parameters">Parameter</TabsTrigger>
              <TabsTrigger value="scenarios">Szenarien</TabsTrigger>
              <TabsTrigger value="formulas">Formeln</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Budget-Kategorien</h3>
                <Button type="button" onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Kategorie hinzufügen
                </Button>
              </div>
              {formData.template_data.structure.map((category, index) => (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Kategorie {index + 1}</CardTitle>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={category.name}
                          onChange={(e) => {
                            const updated = [...formData.template_data.structure];
                            updated[index] = { ...category, name: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, structure: updated }
                            }));
                          }}
                          placeholder="Kategorie-Name"
                        />
                      </div>
                      <div>
                        <Label>Typ</Label>
                        <Select 
                          value={category.type}
                          onValueChange={(value) => {
                            const updated = [...formData.template_data.structure];
                            updated[index] = { ...category, type: value as 'income' | 'expense' | 'investment' };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, structure: updated }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Einnahmen</SelectItem>
                            <SelectItem value="expense">Ausgaben</SelectItem>
                            <SelectItem value="investment">Investitionen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="parameters" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Forecast-Parameter</h3>
                <Button type="button" onClick={addParameter} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Parameter hinzufügen
                </Button>
              </div>
              {formData.template_data.parameters.map((param, index) => (
                <Card key={param.key}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Bezeichnung</Label>
                        <Input
                          value={param.label}
                          onChange={(e) => {
                            const updated = [...formData.template_data.parameters];
                            updated[index] = { ...param, label: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, parameters: updated }
                            }));
                          }}
                          placeholder="Parameter-Name"
                        />
                      </div>
                      <div>
                        <Label>Typ</Label>
                        <Select 
                          value={param.type}
                          onValueChange={(value) => {
                            const updated = [...formData.template_data.parameters];
                            updated[index] = { ...param, type: value as 'percentage' | 'amount' | 'factor' };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, parameters: updated }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Prozent</SelectItem>
                            <SelectItem value="amount">Betrag</SelectItem>
                            <SelectItem value="factor">Faktor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Standardwert</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={param.default_value}
                          onChange={(e) => {
                            const updated = [...formData.template_data.parameters];
                            updated[index] = { ...param, default_value: parseFloat(e.target.value) || 0 };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, parameters: updated }
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Forecast-Szenarien</h3>
                <Button type="button" onClick={addScenario} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Szenario hinzufügen
                </Button>
              </div>
              {formData.template_data.scenarios.map((scenario, index) => (
                <Card key={scenario.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Szenario-Name</Label>
                        <Input
                          value={scenario.name}
                          onChange={(e) => {
                            const updated = [...formData.template_data.scenarios];
                            updated[index] = { ...scenario, name: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, scenarios: updated }
                            }));
                          }}
                          placeholder="z.B. Optimistisch"
                        />
                      </div>
                      <div>
                        <Label>Beschreibung</Label>
                        <Input
                          value={scenario.description}
                          onChange={(e) => {
                            const updated = [...formData.template_data.scenarios];
                            updated[index] = { ...scenario, description: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              template_data: { ...prev.template_data, scenarios: updated }
                            }));
                          }}
                          placeholder="Beschreibung des Szenarios"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="formulas" className="space-y-4">
              <h3 className="text-lg font-medium">Berechnungsformeln</h3>
              <p className="text-sm text-muted-foreground">
                Die Standardformel EBITDA ist bereits enthalten. Weitere Formeln können nach der Erstellung hinzugefügt werden.
              </p>
              {formData.template_data.formulas.map((formula, index) => (
                <Card key={formula.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Formel-Name</Label>
                        <Input value={formula.name} disabled />
                      </div>
                      <div>
                        <Label>Ausdruck</Label>
                        <Input value={formula.expression} disabled />
                      </div>
                      <div>
                        <Label>Beschreibung</Label>
                        <Input value={formula.description || ''} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={createTemplate.isPending}
            >
              {createTemplate.isPending ? 'Erstelle...' : 'Vorlage erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
