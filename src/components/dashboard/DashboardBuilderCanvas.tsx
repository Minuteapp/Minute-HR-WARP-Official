import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  Pin,
  PinOff,
  Palette,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'wide';
  position: { x: number; y: number };
  settings: {
    color?: string;
    darkMode?: boolean;
    refreshInterval?: number;
    pinned?: boolean;
    visible?: boolean;
    customActions?: string[];
  };
  data?: any;
}

interface DashboardContainer {
  id: string;
  widgets: DashboardWidget[];
  gridLayout: { cols: number; rows: number };
}

interface DashboardBuilderCanvasProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  availableWidgets: any[];
  isEditMode: boolean;
}

export const DashboardBuilderCanvas = ({ 
  widgets, 
  onWidgetsChange, 
  availableWidgets,
  isEditMode 
}: DashboardBuilderCanvasProps) => {
  const { 
    draggedItem, 
    startDrag, 
    endDrag, 
    enterDropZone, 
    leaveDropZone, 
    canDrop, 
    isDragging, 
    isDropZoneActive 
  } = useDragAndDrop();

  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-2 row-span-2';
      case 'wide': return 'col-span-4 row-span-1';
      default: return 'col-span-1 row-span-1';
    }
  };

  const handleWidgetDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedItem || draggedItem.type !== 'widget') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / 200); // Grobe Positionierung
    const y = Math.floor((event.clientY - rect.top) / 150);

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: draggedItem.data.type,
      title: draggedItem.data.title,
      size: 'medium',
      position: { x, y },
      settings: {
        color: draggedItem.data.color,
        visible: true,
        pinned: false,
        refreshInterval: 15,
        customActions: []
      },
      data: draggedItem.data
    };

    onWidgetsChange([...widgets, newWidget]);
    endDrag();
  }, [draggedItem, widgets, onWidgetsChange, endDrag]);

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, ...updates }
        : widget
    );
    onWidgetsChange(updatedWidgets);
  };

  const removeWidget = (widgetId: string) => {
    onWidgetsChange(widgets.filter(w => w.id !== widgetId));
  };

  const toggleWidgetSetting = (widgetId: string, setting: keyof DashboardWidget['settings']) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    updateWidget(widgetId, {
      settings: {
        ...widget.settings,
        [setting]: !widget.settings[setting]
      }
    });
  };

  const changeWidgetSize = (widgetId: string, newSize: DashboardWidget['size']) => {
    updateWidget(widgetId, { size: newSize });
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dashboard Vorschau</h3>
        <div className="flex items-center gap-2">
          <Badge variant={isEditMode ? "default" : "secondary"}>
            {isEditMode ? "Bearbeitungsmodus" : "Vorschaumodus"}
          </Badge>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div 
        className={cn(
          "min-h-[600px] grid grid-cols-4 gap-4 p-6 rounded-lg transition-all",
          isDropZoneActive('dashboard') ? "bg-primary/10 border-2 border-primary border-dashed" : "bg-muted/30 border-2 border-dashed border-muted-foreground/20",
          isEditMode && "cursor-crosshair"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          enterDropZone('dashboard');
        }}
        onDragLeave={leaveDropZone}
        onDrop={handleWidgetDrop}
      >
        {widgets.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-xl font-semibold mb-2">Dashboard ist leer</h4>
            <p className="text-center max-w-md">
              {isEditMode 
                ? "Ziehe Widgets aus der Sidebar hier hinein, um dein Dashboard zu gestalten"
                : "Aktiviere den Bearbeitungsmodus, um Widgets hinzuzufügen"
              }
            </p>
          </div>
        ) : (
          widgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                getSizeClasses(widget.size),
                "relative group transition-all duration-200"
              )}
            >
              <Card 
                className={cn(
                  "h-full p-4 transition-all duration-200",
                  selectedWidget === widget.id && "ring-2 ring-primary",
                  isDragging(widget.id) && "opacity-50",
                  widget.settings.pinned && "border-amber-300 bg-amber-50/50",
                  !widget.settings.visible && "opacity-40"
                )}
                onClick={() => setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
              >
                {/* Widget Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${widget.settings.color || 'bg-primary/10'}`}>
                      {widget.data?.icon && <widget.data.icon className="h-4 w-4" />}
                    </div>
                    <h5 className="font-medium text-sm">{widget.title}</h5>
                    {widget.settings.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                  </div>
                  
                  {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidgetSetting(widget.id, 'visible');
                        }}
                      >
                        {widget.settings.visible ? 
                          <Eye className="h-3 w-3" /> : 
                          <EyeOff className="h-3 w-3" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWidgetSetting(widget.id, 'pinned');
                        }}
                      >
                        {widget.settings.pinned ? 
                          <PinOff className="h-3 w-3" /> : 
                          <Pin className="h-3 w-3" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(widget.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Widget Content */}
                <div className="flex-1">
                  {widget.type === 'calendar' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">📅</div>
                      <p className="text-sm text-muted-foreground">Kalender Widget</p>
                    </div>
                  )}
                  {widget.type === 'time' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">⏰</div>
                      <p className="text-sm text-muted-foreground">Zeiterfassung Widget</p>
                    </div>
                  )}
                  {widget.type === 'team' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">👥</div>
                      <p className="text-sm text-muted-foreground">Team Status Widget</p>
                    </div>
                  )}
                  {widget.type === 'projects' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">📁</div>
                      <p className="text-sm text-muted-foreground">Projekte Widget</p>
                    </div>
                  )}
                  {widget.type === 'tasks' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">✅</div>
                      <p className="text-sm text-muted-foreground">Aufgaben Widget</p>
                    </div>
                  )}
                  {widget.type === 'search' && (
                    <div className="text-center py-8">
                      <div className="text-2xl mb-2">🔍</div>
                      <p className="text-sm text-muted-foreground">Suche Widget</p>
                    </div>
                  )}
                </div>

                {/* Widget Settings Panel (wenn ausgewählt) */}
                {selectedWidget === widget.id && isEditMode && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="h-3 w-3" />
                      <span className="text-xs font-medium">Widget Einstellungen</span>
                    </div>
                    
                    {/* Größe */}
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Größe:</label>
                      <div className="flex gap-1">
                        {(['small', 'medium', 'large', 'wide'] as const).map(size => (
                          <Button
                            key={size}
                            variant={widget.size === size ? "default" : "outline"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => changeWidgetSize(widget.id, size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Refresh Interval */}
                    <div className="flex items-center gap-2 mt-2">
                      <RefreshCw className="h-3 w-3" />
                      <span className="text-xs">Auto-Update: {widget.settings.refreshInterval}min</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};