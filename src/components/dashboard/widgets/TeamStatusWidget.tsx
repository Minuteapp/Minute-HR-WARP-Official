import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserCheck, UserX } from 'lucide-react';

interface TeamStatusWidgetProps {
  widget: DashboardWidget;
  data: WidgetData | null;
}

export const TeamStatusWidget: React.FC<TeamStatusWidgetProps> = ({ widget, data }) => {
  const parseValue = (value: string | number | undefined) => {
    if (typeof value === 'string' && value.includes('/')) {
      const [present, total] = value.split('/').map(Number);
      return { present, total };
    }
    return { present: 0, total: 0 };
  };

  const { present, total } = parseValue(data?.value);
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  const getStatusColor = () => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span className="truncate">{widget.title}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <div className="space-y-3">
          {/* Hauptstatistik */}
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {data?.value || '0/0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.label || 'Team-Anwesenheit'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Anwesenheit</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Status-Indikatoren */}
          <div className="flex justify-around text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-success" />
                <span className="text-xs font-medium">{present}</span>
              </div>
              <span className="text-xs text-muted-foreground">Anwesend</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <UserX className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">{total - present}</span>
              </div>
              <span className="text-xs text-muted-foreground">Abwesend</span>
            </div>
          </div>

          {/* Team-Avatars (falls konfiguriert) */}
          {widget.config.showAvatars && (
            <div className="flex items-center justify-center">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(present, widget.config.maxAvatars || 5) }).map((_, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {String.fromCharCode(65 + index)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {present > (widget.config.maxAvatars || 5) && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{present - (widget.config.maxAvatars || 5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {percentage >= 80 ? 'Vollbesetzt' : percentage >= 60 ? 'Normal' : 'Unterbesetzt'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};