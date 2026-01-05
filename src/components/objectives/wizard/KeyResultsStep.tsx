import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Target, Sparkles } from 'lucide-react';
import type { KeyResult, ObjectiveSuggestion } from '@/types/objectives';

interface KeyResultsStepProps {
  keyResults: Omit<KeyResult, 'id' | 'objective_id' | 'created_at' | 'last_updated'>[];
  validation: Record<string, string[]>;
  suggestions: ObjectiveSuggestion[];
  onUpdate: (keyResults: Omit<KeyResult, 'id' | 'objective_id' | 'created_at' | 'last_updated'>[]) => void;
}

export const KeyResultsStep = ({ keyResults, validation, suggestions, onUpdate }: KeyResultsStepProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const keyResultSuggestions = suggestions.filter(s => s.suggestion_type === 'key_result');

  const addKeyResult = () => {
    const newKeyResult = {
      metric: '',
      target_value: 0,
      current_value: 0,
      unit: '',
      data_source: 'manual' as const,
      update_frequency: 'weekly' as const,
      trend: 'stable' as const,
      metadata: {}
    };
    onUpdate([...keyResults, newKeyResult]);
  };

  const removeKeyResult = (index: number) => {
    const updated = keyResults.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const updateKeyResult = (index: number, updates: Partial<typeof keyResults[0]>) => {
    const updated = keyResults.map((kr, i) => 
      i === index ? { ...kr, ...updates } : kr
    );
    onUpdate(updated);
  };

  const applySuggestions = (suggestion: ObjectiveSuggestion) => {
    if (suggestion.suggested_metrics && Array.isArray(suggestion.suggested_metrics)) {
      const newKeyResults = suggestion.suggested_metrics.map(metric => ({
        metric: metric.metric || '',
        target_value: metric.target_value || 0,
        current_value: 0,
        unit: metric.unit || '',
        data_source: 'manual' as const,
        update_frequency: 'weekly' as const,
        trend: 'stable' as const,
        metadata: {}
      }));
      onUpdate([...keyResults, ...newKeyResults]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const updatedKeyResults = [...keyResults];
    const draggedItem = updatedKeyResults[draggedIndex];
    updatedKeyResults.splice(draggedIndex, 1);
    updatedKeyResults.splice(dropIndex, 0, draggedItem);
    
    onUpdate(updatedKeyResults);
    setDraggedIndex(null);
  };

  const getDataSourceLabel = (dataSource: string) => {
    switch (dataSource) {
      case 'manual': return 'Manuell';
      case 'automatic': return 'Automatisch';
      case 'integration': return 'Integration';
      default: return dataSource;
    }
  };

  const getUpdateFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Täglich';
      case 'weekly': return 'Wöchentlich';
      case 'monthly': return 'Monatlich';
      case 'quarterly': return 'Quartalsweise';
      default: return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      {keyResultSuggestions.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-medium text-green-900">KI-Vorschläge für Key Results</h4>
            <Badge variant="secondary" className="text-xs">
              {Math.round(keyResultSuggestions[0]?.confidence_score * 100)}% Konfidenz
            </Badge>
          </div>
          <div className="space-y-3">
            {keyResultSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Empfohlene Metriken:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applySuggestions(suggestion)}
                  >
                    Alle übernehmen
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {suggestion.suggested_metrics?.map((metric: any, idx: number) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">{metric.metric}</div>
                      <div className="text-muted-foreground">
                        Ziel: {metric.target_value} {metric.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Key Results</h4>
            <p className="text-xs text-muted-foreground">
              Definieren Sie messbare Ergebnisse für Ihr Ziel
            </p>
          </div>
          <Button onClick={addKeyResult} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Key Result hinzufügen
          </Button>
        </div>

        {validation.key_results && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
            {validation.key_results[0]}
          </div>
        )}

        {keyResults.map((keyResult, index) => (
          <Card
            key={index}
            className="p-4"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Key Result #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyResult(index)}
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Metrik *</Label>
                    <Input
                      placeholder="z.B. Umsatz, Neue Kunden, Conversion Rate"
                      value={keyResult.metric}
                      onChange={(e) => updateKeyResult(index, { metric: e.target.value })}
                      className={validation[`key_result_${index}_metric`] ? 'border-destructive' : ''}
                    />
                    {validation[`key_result_${index}_metric`] && (
                      <p className="text-sm text-destructive">
                        {validation[`key_result_${index}_metric`][0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Zielwert *</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={keyResult.target_value || ''}
                      onChange={(e) => updateKeyResult(index, { target_value: parseFloat(e.target.value) || 0 })}
                      className={validation[`key_result_${index}_target`] ? 'border-destructive' : ''}
                    />
                    {validation[`key_result_${index}_target`] && (
                      <p className="text-sm text-destructive">
                        {validation[`key_result_${index}_target`][0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Einheit</Label>
                    <Input
                      placeholder="EUR, %, Anzahl, etc."
                      value={keyResult.unit || ''}
                      onChange={(e) => updateKeyResult(index, { unit: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Datenquelle</Label>
                    <Select
                      value={keyResult.data_source}
                      onValueChange={(value) => updateKeyResult(index, { data_source: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manuell</SelectItem>
                        <SelectItem value="automatic">Automatisch</SelectItem>
                        <SelectItem value="integration">Integration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Update-Frequenz</Label>
                    <Select
                      value={keyResult.update_frequency}
                      onValueChange={(value) => updateKeyResult(index, { update_frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Quartalsweise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {keyResults.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-sm font-medium mb-2">Keine Key Results definiert</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Fügen Sie messbare Ergebnisse hinzu, um den Fortschritt Ihres Ziels zu verfolgen.
            </p>
            <Button onClick={addKeyResult} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Erstes Key Result hinzufügen
            </Button>
          </Card>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Tipps für gute Key Results</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Formulieren Sie spezifische, messbare Ergebnisse</li>
              <li>• Verwenden Sie Zahlen, Prozentsätze oder binäre Ziele</li>
              <li>• 3-5 Key Results pro Ziel sind optimal</li>
              <li>• Wählen Sie die passende Update-Frequenz für Ihre Metriken</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};