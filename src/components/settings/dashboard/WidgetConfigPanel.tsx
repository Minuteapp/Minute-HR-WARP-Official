import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Save } from 'lucide-react';

interface DashboardWidget {
  i: string;
  type: string;
  config: {
    title: string;
    icon?: string;
    dataSource?: string;
    color?: string;
    actions?: string[];
  };
}

interface WidgetConfigPanelProps {
  widget: DashboardWidget | null;
  onClose: () => void;
  onSave: (widget: DashboardWidget) => void;
}

const availableIcons = [
  { value: 'activity', label: 'Activity' },
  { value: 'users', label: 'Users' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'bell', label: 'Bell' },
  { value: 'target', label: 'Target' },
  { value: 'clock', label: 'Clock' },
  { value: 'zap', label: 'Zap' },
  { value: 'alert-circle', label: 'Alert' },
  { value: 'bar-chart', label: 'Bar Chart' },
  { value: 'check-square', label: 'Check Square' }
];

const availableColors = [
  { value: 'blue', label: 'Blau', class: 'bg-blue-500' },
  { value: 'green', label: 'Grün', class: 'bg-green-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'red', label: 'Rot', class: 'bg-red-500' }
];

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({
  widget,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('activity');
  const [color, setColor] = useState('blue');
  const [dataSource, setDataSource] = useState('');

  useEffect(() => {
    if (widget) {
      setTitle(widget.config.title || '');
      setIcon(widget.config.icon || 'activity');
      setColor(widget.config.color || 'blue');
      setDataSource(widget.config.dataSource || '');
    }
  }, [widget]);

  if (!widget) {
    return (
      <div className="w-96 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>Kein Widget ausgewählt</p>
            <p className="text-sm mt-2">
              Klicken Sie auf ein Widget, um es zu konfigurieren
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const updatedWidget = {
      ...widget,
      config: {
        ...widget.config,
        title,
        icon,
        color,
        dataSource
      }
    };
    onSave(updatedWidget);
    onClose();
  };

  return (
    <div className="w-96 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Widget-Einstellungen</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-6">
          {/* Widget Info */}
          <div>
            <Label className="text-xs text-muted-foreground">Widget-Typ</Label>
            <Badge variant="outline" className="mt-1">
              {widget.type}
            </Badge>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Widget-Titel"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    {iconOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="grid grid-cols-5 gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    h-10 rounded-md ${colorOption.class}
                    ${color === colorOption.value ? 'ring-2 ring-offset-2 ring-primary' : ''}
                    hover:scale-105 transition-transform
                  `}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Data Source */}
          <div className="space-y-2">
            <Label htmlFor="dataSource">Datenquelle (optional)</Label>
            <Input
              id="dataSource"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              placeholder="z.B. ds_team_coverage"
            />
            <p className="text-xs text-muted-foreground">
              ID der Datenquelle für dynamische Inhalte
            </p>
          </div>

          {/* Widget-specific configs would go here */}
          {widget.type === 'quick_actions' && (
            <div className="space-y-2">
              <Label>Aktionen</Label>
              <p className="text-xs text-muted-foreground">
                Aktionen-Konfiguration kommt in Phase 3
              </p>
            </div>
          )}

          {/* Visibility Rules */}
          <div className="space-y-2">
            <Label>Sichtbarkeit</Label>
            <p className="text-xs text-muted-foreground">
              Rollenbasierte Sichtbarkeit wird in Phase 2 erweitert
            </p>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
};
