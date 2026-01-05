import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, GripVertical, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviceType } from './DeviceSwitcher';
import { WidgetDefinition } from './WidgetPalette';
import {
  Clock,
  Users,
  Calendar,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Bell,
  Star,
  Target,
  Briefcase,
  FileText,
  MessageSquare,
  Activity,
  PieChart,
  Zap,
} from 'lucide-react';

interface PreviewWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
}

interface DashboardLivePreviewProps {
  device: DeviceType;
  widgets: PreviewWidget[];
  onWidgetRemove: (widgetId: string) => void;
  onWidgetReorder: (widgets: PreviewWidget[]) => void;
  selectedWidgetId: string | null;
  onWidgetSelect: (widgetId: string | null) => void;
  isEditMode: boolean;
}

const deviceDimensions: Record<DeviceType, { width: number; height: number; scale: number }> = {
  desktop: { width: 1200, height: 800, scale: 0.55 },
  tablet: { width: 768, height: 1024, scale: 0.5 },
  mobile: { width: 375, height: 812, scale: 0.55 },
};

const widgetIcons: Record<string, React.ReactNode> = {
  time_tracking: <Clock className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  team_status: <Users className="h-5 w-5" />,
  notifications: <Bell className="h-5 w-5" />,
  tasks: <CheckSquare className="h-5 w-5" />,
  goals: <Target className="h-5 w-5" />,
  kpi_card: <TrendingUp className="h-5 w-5" />,
  bar_chart: <BarChart3 className="h-5 w-5" />,
  progress_ring: <PieChart className="h-5 w-5" />,
  recruiting: <Briefcase className="h-5 w-5" />,
  documents: <FileText className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
  favorites: <Star className="h-5 w-5" />,
  quick_actions: <Zap className="h-5 w-5" />,
  messages: <MessageSquare className="h-5 w-5" />,
};

export const DashboardLivePreview: React.FC<DashboardLivePreviewProps> = ({
  device,
  widgets,
  onWidgetRemove,
  onWidgetReorder,
  selectedWidgetId,
  onWidgetSelect,
  isEditMode,
}) => {
  const dimensions = deviceDimensions[device];
  
  const getGridCols = () => {
    switch (device) {
      case 'mobile': return 2;
      case 'tablet': return 3;
      default: return 4;
    }
  };

  const getWidgetSpan = (size: string) => {
    switch (size) {
      case 'small': return 1;
      case 'medium': return device === 'mobile' ? 2 : 2;
      case 'large': return device === 'mobile' ? 2 : device === 'tablet' ? 3 : 4;
      default: return 1;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 overflow-auto">
      {/* Device Frame */}
      <div 
        className={cn(
          'bg-background rounded-xl shadow-2xl overflow-hidden border-4 border-foreground/20',
          device === 'mobile' && 'rounded-[2rem]',
          device === 'tablet' && 'rounded-2xl'
        )}
        style={{
          width: dimensions.width * dimensions.scale,
          height: dimensions.height * dimensions.scale,
        }}
      >
        {/* Scaled Content Container */}
        <div
          className="origin-top-left overflow-auto"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transform: `scale(${dimensions.scale})`,
          }}
        >
          {/* Header für Mobile/Tablet */}
          {device !== 'desktop' && (
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary p-4">
              <div className="text-white text-center font-bold text-xl">
                MINUTE
              </div>
            </div>
          )}

          {/* Dashboard Grid */}
          <div 
            className={cn(
              'p-4 grid gap-3',
              device === 'desktop' && 'p-6 gap-4'
            )}
            style={{
              gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
            }}
          >
            {widgets.length === 0 ? (
              <div 
                className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground"
              >
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm font-medium">Keine Widgets</p>
                <p className="text-xs">Füge Widgets aus der Palette hinzu</p>
              </div>
            ) : (
              widgets.map((widget) => (
                <Card
                  key={widget.id}
                  className={cn(
                    'relative p-3 cursor-pointer transition-all',
                    selectedWidgetId === widget.id && 'ring-2 ring-primary',
                    isEditMode && 'hover:shadow-lg'
                  )}
                  style={{
                    gridColumn: `span ${getWidgetSpan(widget.size)}`,
                  }}
                  onClick={() => isEditMode && onWidgetSelect(widget.id)}
                >
                  {isEditMode && (
                    <>
                      {/* Drag Handle */}
                      <div className="absolute top-1 left-1 p-1 text-muted-foreground cursor-grab">
                        <GripVertical className="h-3 w-3" />
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWidgetRemove(widget.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary mb-2">
                      {widgetIcons[widget.type] || <Settings className="h-5 w-5" />}
                    </div>
                    <span className="text-xs font-medium text-center">{widget.title}</span>
                    {isEditMode && (
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {widget.size}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export type { PreviewWidget };
