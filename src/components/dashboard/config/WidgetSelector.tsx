import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WidgetType {
  id: string;
  module_name: string;
  widget_type: string;
  display_name: string;
  description: string;
  icon: string;
  default_width: number;
  default_height: number;
}

interface DashboardConfig {
  id: string;
  name: string;
  is_default: boolean;
  layout_config: any[];
}

interface WidgetSelectorProps {
  availableWidgets: WidgetType[];
  selectedConfig: DashboardConfig;
  onConfigUpdate: (config: DashboardConfig) => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  availableWidgets,
  selectedConfig,
  onConfigUpdate
}) => {
  const addWidget = async (widget: WidgetType) => {
    try {
      // Erstelle Container in der Datenbank
      const { data: containerData, error: containerError } = await supabase
        .from('dashboard_containers')
        .insert({
          dashboard_config_id: selectedConfig.id,
          container_type: 'widget',
          module_name: widget.module_name,
          widget_type: widget.widget_type,
          position_row: 1,
          position_column: 1,
          width: widget.default_width,
          height: widget.default_height,
          config: {}
        })
        .select()
        .single();

      if (containerError) throw containerError;

      // Update das lokale Config
      const newContainer = {
        id: containerData.id,
        display_name: widget.display_name,
        module_name: widget.module_name,
        widget_type: widget.widget_type,
        width: widget.default_width,
        height: widget.default_height,
        position_row: 1,
        position_column: 1,
        config: {}
      };

      const updatedConfig = {
        ...selectedConfig,
        layout_config: [...selectedConfig.layout_config, newContainer]
      };

      // Update das Dashboard Config in der Datenbank
      await supabase
        .from('dashboard_configs')
        .update({ layout_config: updatedConfig.layout_config })
        .eq('id', selectedConfig.id);

      onConfigUpdate(updatedConfig);
      toast.success(`${widget.display_name} wurde hinzugefügt`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Widgets:', error);
      toast.error('Fehler beim Hinzufügen des Widgets');
    }
  };

  // Gruppiere Widgets nach Modulen
  const widgetsByModule = availableWidgets.reduce((acc, widget) => {
    if (!acc[widget.module_name]) {
      acc[widget.module_name] = [];
    }
    acc[widget.module_name].push(widget);
    return acc;
  }, {} as Record<string, WidgetType[]>);

  const moduleDisplayNames: Record<string, string> = {
    calendar: 'Kalender',
    time_tracking: 'Zeiterfassung',
    tasks: 'Aufgaben',
    team: 'Team',
    projects: 'Projekte',
    notifications: 'Benachrichtigungen',
    quick_actions: 'Schnelle Aktionen',
    weather: 'Wetter',
    budget: 'Budget'
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Verfügbare Widgets</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {Object.entries(widgetsByModule).map(([moduleName, widgets]) => (
              <div key={moduleName}>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  {moduleDisplayNames[moduleName] || moduleName}
                </h4>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="p-3 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{widget.display_name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {widget.default_width}x{widget.default_height}
                        </Badge>
                      </div>
                      
                      {widget.description && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {widget.description}
                        </p>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => addWidget(widget)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Hinzufügen
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WidgetSelector;