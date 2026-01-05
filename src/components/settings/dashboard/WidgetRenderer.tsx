import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useWidgetData } from '@/hooks/dashboard/useWidgetData';
import { 
  TrendingUp, TrendingDown, Activity, Users, Calendar, 
  Bell, Target, Clock, Zap, Loader2
} from 'lucide-react';

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

interface WidgetRendererProps {
  widget: DashboardWidget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const { data, isLoading } = useWidgetData(widget.config.dataSource, 30);

  const getIcon = () => {
    switch (widget.config.icon) {
      case 'activity': return <Activity className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'bell': return <Bell className="h-5 w-5" />;
      case 'target': return <Target className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'zap': return <Zap className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render based on widget type
  switch (widget.type) {
    case 'kpi_card':
      return (
        <div className="h-full p-4 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {getIcon()}
            </div>
            {data?.trend && (
              <Badge variant={data.trend.direction === 'up' ? 'default' : 'secondary'}>
                {data.trend.direction === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {data.trend.value}
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{widget.config.title}</h3>
          <div className="text-3xl font-bold mt-auto">
            {data?.value || 0} <span className="text-sm text-muted-foreground">{data?.label}</span>
          </div>
        </div>
      );

    case 'progress_ring':
      const percentage = data?.value || 0;
      return (
        <div className="h-full p-4 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-center">{widget.config.title}</h3>
        </div>
      );

    case 'list_compact':
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h3 className="font-medium">{widget.config.title}</h3>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {data?.items?.slice(0, 5).map((item: any, index: number) => (
              <div
                key={index}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors mb-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{item.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>
              </div>
            )) || <div className="text-sm text-muted-foreground text-center py-4">Keine Daten</div>}
          </div>
        </div>
      );

    case 'quick_actions':
      const actions = widget.config.actions || ['action1', 'action2'];
      return (
        <div className="h-full p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5" />
            <h3 className="font-medium">{widget.config.title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" className="w-full">
                {action}
              </Button>
            ))}
          </div>
        </div>
      );

    case 'bar_chart':
    case 'line_chart':
      return (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h3 className="font-medium">{widget.config.title}</h3>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Chart Placeholder</div>
          </div>
        </div>
      );

    default:
      return (
        <div className="h-full p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">{widget.config.title}</div>
            <div className="text-xs text-muted-foreground mt-1">Widget-Typ: {widget.type}</div>
          </div>
        </div>
      );
  }
};
