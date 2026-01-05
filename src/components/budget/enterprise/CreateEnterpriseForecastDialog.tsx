
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEnterpriseForecast } from "@/hooks/useBudgetEnterprise";
import type { CreateEnterpriseForcastRequest } from "@/types/budgetEnterprise";

interface CreateEnterpriseForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateEnterpriseForecastDialog = ({ open, onOpenChange }: CreateEnterpriseForecastDialogProps) => {
  const [formData, setFormData] = useState({
    forecast_name: '',
    description: '',
    forecast_type: 'ml_trend' as const,
    scenario_type: 'realistic' as const,
    dimension_type: 'department' as const,
    forecast_period_start: '',
    forecast_period_end: '',
  });

  const createForecast = useCreateEnterpriseForecast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: CreateEnterpriseForcastRequest = {
      forecast_name: formData.forecast_name,
      description: formData.description,
      forecast_type: formData.forecast_type,
      scenario_type: formData.scenario_type,
      dimension_type: formData.dimension_type,
      forecast_period_start: formData.forecast_period_start,
      forecast_period_end: formData.forecast_period_end,
    };

    try {
      await createForecast.mutateAsync(request);
      onOpenChange(false);
      setFormData({
        forecast_name: '',
        description: '',
        forecast_type: 'ml_trend',
        scenario_type: 'realistic',
        dimension_type: 'department',
        forecast_period_start: '',
        forecast_period_end: '',
      });
    } catch (error) {
      console.error('Fehler beim Erstellen der Prognose:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Enterprise Prognose erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="forecast_name">Prognose Name</Label>
            <Input
              id="forecast_name"
              value={formData.forecast_name}
              onChange={(e) => setFormData(prev => ({ ...prev, forecast_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="forecast_type">Prognose-Typ</Label>
            <Select value={formData.forecast_type} onValueChange={(value) => setFormData(prev => ({ ...prev, forecast_type: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml_trend">ML Trend</SelectItem>
                <SelectItem value="simple_projection">Einfache Projektion</SelectItem>
                <SelectItem value="trend_analysis">Trend-Analyse</SelectItem>
                <SelectItem value="ml_prediction">ML Vorhersage</SelectItem>
                <SelectItem value="scenario_modeling">Szenario-Modellierung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scenario_type">Szenario-Typ</Label>
            <Select value={formData.scenario_type} onValueChange={(value) => setFormData(prev => ({ ...prev, scenario_type: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimistic">Optimistisch</SelectItem>
                <SelectItem value="realistic">Realistisch</SelectItem>
                <SelectItem value="pessimistic">Pessimistisch</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dimension_type">Dimension</Label>
            <Select value={formData.dimension_type} onValueChange={(value) => setFormData(prev => ({ ...prev, dimension_type: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">Abteilung</SelectItem>
                <SelectItem value="project">Projekt</SelectItem>
                <SelectItem value="cost_center">Kostenstelle</SelectItem>
                <SelectItem value="region">Region</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="forecast_period_start">Startdatum</Label>
              <Input
                id="forecast_period_start"
                type="date"
                value={formData.forecast_period_start}
                onChange={(e) => setFormData(prev => ({ ...prev, forecast_period_start: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="forecast_period_end">Enddatum</Label>
              <Input
                id="forecast_period_end"
                type="date"
                value={formData.forecast_period_end}
                onChange={(e) => setFormData(prev => ({ ...prev, forecast_period_end: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createForecast.isPending}>
              {createForecast.isPending ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
