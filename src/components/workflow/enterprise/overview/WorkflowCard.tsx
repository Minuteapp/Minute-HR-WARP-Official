import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Edit, Copy, Pause, Play, Trash2, Clock, CheckCircle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    status: string | null;
    module: string | null;
    execution_count: number | null;
    success_rate: number | null;
    avg_duration_minutes: number | null;
    last_execution_at: string | null;
  };
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pausiert</Badge>;
      case 'draft':
        return <Badge variant="secondary">Entwurf</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModuleBadge = (module: string | null) => {
    if (!module) return null;
    return (
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
        {module}
      </Badge>
    );
  };

  const successRate = Number(workflow.success_rate) || 0;
  const executionCount = workflow.execution_count || 0;
  const avgDuration = Number(workflow.avg_duration_minutes) || 0;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{workflow.name}</h4>
              {getStatusBadge(workflow.status)}
              {getModuleBadge(workflow.module)}
            </div>
            {workflow.description && (
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ausführungen:</span>
                <span className="font-medium text-foreground">{executionCount}</span>
              </div>
              
              <div className="flex items-center gap-2 min-w-[200px]">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Erfolgsquote:</span>
                <Progress value={successRate} className="w-20 h-2" />
                <span className="font-medium text-foreground">{successRate.toFixed(0)}%</span>
              </div>

              {workflow.last_execution_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Letzte Ausführung:</span>
                  <span className="font-medium text-foreground">
                    {formatDistanceToNow(new Date(workflow.last_execution_at), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ø Dauer:</span>
                <span className="font-medium text-foreground">{avgDuration.toFixed(1)} Min</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {workflow.status === 'active' ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
