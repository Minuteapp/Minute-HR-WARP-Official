
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useForecastTemplate, useCreateForecastFromTemplate } from '@/hooks/useForecastTemplates';

interface ForecastFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

export const ForecastFromTemplateDialog = ({ 
  open, 
  onOpenChange, 
  templateId 
}: ForecastFromTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    periodStart: undefined as Date | undefined,
    periodEnd: undefined as Date | undefined,
    scenario: '',
    parameterOverrides: {} as Record<string, number>
  });

  const { data: template } = useForecastTemplate(templateId);
  const createForecast = useCreateForecastFromTemplate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.periodStart || !formData.periodEnd) {
      return;
    }

    try {
      await createForecast.mutateAsync({
        templateId,
        params: {
          name: formData.name,
          period_start: formData.periodStart.toISOString().split('T')[0],
          period_end: formData.periodEnd.toISOString().split('T')[0],
          scenario: formData.scenario || undefined,
          parameter_overrides: formData.parameterOverrides
        }
      });
      
      onOpenChange(false);
      setFormData({
        name: '',
        periodStart: undefined,
        periodEnd: undefined,
        scenario: '',
        parameterOverrides: {}
      });
    } catch (error) {
      console.error('Error creating forecast:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Forecast aus Vorlage erstellen: {template?.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name des Forecasts *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="z.B. Q1 2024 Budget-Forecast"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.periodStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.periodStart ? (
                      format(formData.periodStart, "dd.MM.yyyy", { locale: de })
                    ) : (
                      "Datum auswählen"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.periodStart}
                    onSelect={(date) => setFormData(prev => ({ ...prev, periodStart: date }))}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Enddatum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.periodEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.periodEnd ? (
                      format(formData.periodEnd, "dd.MM.yyyy", { locale: de })
                    ) : (
                      "Datum auswählen"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.periodEnd}
                    onSelect={(date) => setFormData(prev => ({ ...prev, periodEnd: date }))}
                    initialFocus
                    locale={de}
                    disabled={(date) => formData.periodStart ? date < formData.periodStart : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {template?.template_data.scenarios && template.template_data.scenarios.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="scenario">Szenario (optional)</Label>
              <Select 
                value={formData.scenario} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, scenario: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Szenario auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Kein spezifisches Szenario</SelectItem>
                  {template.template_data.scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={createForecast.isPending}
            >
              {createForecast.isPending ? 'Erstelle...' : 'Forecast erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
