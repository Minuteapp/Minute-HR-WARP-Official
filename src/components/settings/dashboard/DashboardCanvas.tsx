import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidgetRenderer } from './WidgetRenderer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Settings } from 'lucide-react';

interface DashboardWidget {
  i: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: {
    title: string;
    icon?: string;
    dataSource?: string;
    color?: string;
  };
}

interface DashboardCanvasProps {
  widgets: DashboardWidget[];
  onLayoutChange: (layout: Layout[], widgets: DashboardWidget[]) => void;
  onWidgetRemove: (widgetId: string) => void;
  onWidgetSelect: (widget: DashboardWidget) => void;
  isEditMode: boolean;
  cols?: number;
  rowHeight?: number;
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  widgets,
  onLayoutChange,
  onWidgetRemove,
  onWidgetSelect,
  isEditMode,
  cols = 4,
  rowHeight = 140
}) => {
  const [hoveredWidget, setHoveredWidget] = useState<string | null>(null);

  const handleLayoutChange = (layout: Layout[]) => {
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.i);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        };
      }
      return widget;
    });
    onLayoutChange(layout, updatedWidgets);
  };

  const handleDrop = (layout: Layout[], layoutItem: any, e: DragEvent) => {
    e.preventDefault();
    const widgetData = e.dataTransfer?.getData('widget');
    if (!widgetData) return;

    const widget = JSON.parse(widgetData);
    const newWidget: DashboardWidget = {
      i: `widget-${Date.now()}`,
      type: widget.id,
      x: layoutItem.x,
      y: layoutItem.y,
      w: widget.size?.w || 1,
      h: widget.size?.h || 1,
      config: {
        title: widget.name,
        icon: widget.icon,
        dataSource: undefined
      }
    };

    const updatedWidgets = [...widgets, newWidget];
    const newLayout = updatedWidgets.map(w => ({
      i: w.i,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h
    }));
    
    onLayoutChange(newLayout, updatedWidgets);
  };

  return (
    <div className="flex-1 p-6 bg-muted/30 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {widgets.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Leeres Dashboard</h3>
              <p className="text-muted-foreground max-w-sm">
                Ziehen Sie Widgets aus der Bibliothek hierher oder wenden Sie eine Vorlage an
              </p>
            </div>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layout={widgets.map(w => ({ i: w.i, x: w.x, y: w.y, w: w.w, h: w.h }))}
            cols={cols}
            rowHeight={rowHeight}
            width={1200}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            isDroppable={isEditMode}
            onDrop={handleDrop}
            droppingItem={{ i: 'drop', w: 1, h: 1 }}
            compactType="vertical"
            preventCollision={false}
          >
            {widgets.map((widget) => (
              <div
                key={widget.i}
                className="relative group"
                onMouseEnter={() => setHoveredWidget(widget.i)}
                onMouseLeave={() => setHoveredWidget(null)}
              >
                <Card className="h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <WidgetRenderer widget={widget} />
                  
                  {isEditMode && hoveredWidget === widget.i && (
                    <div className="absolute top-2 right-2 flex gap-1 bg-background/95 backdrop-blur rounded-lg p-1 shadow-lg">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetSelect(widget);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetRemove(widget.i);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </GridLayout>
        )}
      </div>
    </div>
  );
};
