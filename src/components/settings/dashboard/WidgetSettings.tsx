import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { X, Settings, Trash2 } from 'lucide-react';
import { PreviewWidget } from './DashboardLivePreview';

interface WidgetSettingsPanelProps {
  widget: PreviewWidget | null;
  onClose: () => void;
  onUpdate: (widgetId: string, updates: Partial<PreviewWidget>) => void;
  onDelete: (widgetId: string) => void;
}

export const WidgetSettingsPanel: React.FC<WidgetSettingsPanelProps> = ({
  widget,
  onClose,
  onUpdate,
  onDelete,
}) => {
  if (!widget) {
    return (
      <div className="w-72 border-l bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
        <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm text-muted-foreground">
          Wähle ein Widget aus, um dessen Einstellungen zu bearbeiten
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Widget-Einstellungen</h3>
          <p className="text-xs text-muted-foreground">{widget.title}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-4 space-y-6 overflow-auto">
        {/* Size */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Größe</Label>
          <Select
            value={widget.size}
            onValueChange={(value: 'small' | 'medium' | 'large') => 
              onUpdate(widget.id, { size: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Klein (1x1)</SelectItem>
              <SelectItem value="medium">Mittel (2x1)</SelectItem>
              <SelectItem value="large">Groß (4x1)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Titel</Label>
          <Input
            value={widget.title}
            onChange={(e) => onUpdate(widget.id, { title: e.target.value })}
            className="h-9"
          />
        </div>

        {/* Visibility Options */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Sichtbarkeit</Label>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Desktop</span>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Tablet</span>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Mobile</span>
            <Switch defaultChecked />
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Aktualisierung</Label>
          <div className="space-y-3">
            <Slider
              defaultValue={[15]}
              min={1}
              max={60}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground text-center">
              Alle 15 Minuten
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDelete(widget.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Widget entfernen
        </Button>
      </div>
    </div>
  );
};

// Keep default export for backwards compatibility
export default WidgetSettingsPanel;
