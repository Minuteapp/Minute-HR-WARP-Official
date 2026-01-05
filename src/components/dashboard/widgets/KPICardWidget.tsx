import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  CheckSquare, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardWidgetProps {
  widget: DashboardWidget;
  data: WidgetData | null;
}

export const KPICardWidget: React.FC<KPICardWidgetProps> = ({ widget, data }) => {
  const getIcon = () => {
    switch (widget.icon) {
      case 'clock':
        return <Clock className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'check-square':
        return <CheckSquare className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getStatusIcon = () => {
    switch (data?.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (data?.status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  const getBadgeVariant = () => {
    switch (data?.status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", getStatusColor(), "bg-current/10")}>
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate">
                {widget.title}
              </h3>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* Hauptwert */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center">
            <div className={cn("text-2xl font-bold", getStatusColor())}>
              {data?.value || '—'}
            </div>
            {data?.label && (
              <p className="text-xs text-muted-foreground mt-1">
                {data.label}
              </p>
            )}
          </div>

          {/* Progress Bar (falls konfiguriert) */}
          {widget.config.showProgress && typeof data?.value === 'number' && (
            <div className="mt-3">
              <Progress 
                value={Math.min(data.value, 100)} 
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Footer mit Status Badge */}
        {data?.status && (
          <div className="flex justify-center mt-3">
            <Badge variant={getBadgeVariant()} className="text-xs">
              {data.status === 'success' && 'Normal'}
              {data.status === 'warning' && 'Aufmerksamkeit'}
              {data.status === 'error' && 'Kritisch'}
              {data.status === 'info' && 'Information'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};