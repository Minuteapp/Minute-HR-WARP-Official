import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles } from 'lucide-react';
import type { CreateObjectiveInput, ObjectiveSuggestion } from '@/types/objectives';

interface BasicInfoStepProps {
  data: Partial<CreateObjectiveInput>;
  validation: Record<string, string[]>;
  suggestions: ObjectiveSuggestion[];
  onUpdate: (updates: Partial<CreateObjectiveInput>) => void;
}

export const BasicInfoStep = ({ data, validation, suggestions, onUpdate }: BasicInfoStepProps) => {
  const titleSuggestions = suggestions.filter(s => s.suggestion_type === 'title');

  const applySuggestion = (suggestion: ObjectiveSuggestion) => {
    if (suggestion.suggested_title) {
      onUpdate({ title: suggestion.suggested_title });
    }
  };

  const getObjectiveTypeLabel = (type: string) => {
    switch (type) {
      case 'okr': return 'OKR (Objectives & Key Results)';
      case 'kpi': return 'KPI (Key Performance Indicator)';
      case 'strategic': return 'Strategisches Ziel';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      case 'critical': return 'text-red';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          placeholder="z.B. Umsatz um 15% steigern"
          value={data.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className={validation.title ? 'border-destructive' : ''}
        />
        {validation.title && (
          <p className="text-sm text-destructive">{validation.title[0]}</p>
        )}
      </div>

      {/* AI Suggestions */}
      {titleSuggestions.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">KI-Vorschläge</h4>
            <Badge variant="secondary" className="text-xs">
              {Math.round(titleSuggestions[0]?.confidence_score * 100)}% Konfidenz
            </Badge>
          </div>
          <div className="space-y-2">
            {titleSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <span className="text-sm">{suggestion.suggested_title}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion(suggestion)}
                >
                  Übernehmen
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          placeholder="Detaillierte Beschreibung des Ziels..."
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
        />
      </div>

      {/* Objective Type and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ziel-Typ *</Label>
          <Select
            value={data.objective_type || 'okr'}
            onValueChange={(value) => onUpdate({ objective_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="okr">OKR (Objectives & Key Results)</SelectItem>
              <SelectItem value="kpi">KPI (Key Performance Indicator)</SelectItem>
              <SelectItem value="strategic">Strategisches Ziel</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">
            {data.objective_type === 'okr' && 'Ziel mit messbaren Schlüsselergebnissen'}
            {data.objective_type === 'kpi' && 'Einzelner Leistungsindikator'}
            {data.objective_type === 'strategic' && 'Langfristiges strategisches Ziel'}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priorität *</Label>
          <Select
            value={data.priority || 'medium'}
            onValueChange={(value) => onUpdate({ priority: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  Niedrig
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  Mittel
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  Hoch
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  Kritisch
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="period_start">Startdatum *</Label>
          <Input
            id="period_start"
            type="date"
            value={data.period_start || ''}
            onChange={(e) => onUpdate({ period_start: e.target.value })}
            className={validation.period_start ? 'border-destructive' : ''}
          />
          {validation.period_start && (
            <p className="text-sm text-destructive">{validation.period_start[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_end">Enddatum *</Label>
          <Input
            id="period_end"
            type="date"
            value={data.period_end || ''}
            onChange={(e) => onUpdate({ period_end: e.target.value })}
            className={validation.period_end ? 'border-destructive' : ''}
          />
          {validation.period_end && (
            <p className="text-sm text-destructive">{validation.period_end[0]}</p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Tipp zur Zielformulierung</h4>
            <p className="text-sm text-muted-foreground">
              Formulieren Sie Ihr Ziel spezifisch, messbar und zeitgebunden. 
              Die KI wird Ihnen im nächsten Schritt passende Key Results vorschlagen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};