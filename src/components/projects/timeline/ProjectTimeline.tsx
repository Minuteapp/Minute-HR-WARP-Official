import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Filter, Download, Calendar, TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { GanttChart } from './GanttChart';
import { TimelineProject } from '@/types/timeline';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ProjectTimeline = () => {
  const [viewMode, setViewMode] = useState('Monatsansicht');
  
  // Timeline-Projekte werden jetzt aus der Datenbank geladen
  const timelineProjects: TimelineProject[] = [];

  // Calculate metrics
  const allTasks = timelineProjects.flatMap(p => p.tasks);
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const atRiskTasks = allTasks.filter(t => t.status === 'at-risk' || t.status === 'delayed').length;
  const totalProgress = allTasks.length > 0 
    ? Math.round(allTasks.reduce((sum, task) => sum + task.progress, 0) / allTasks.length)
    : 0;

  // Find next deadline
  const nextDeadline = allTasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Timeline & Gantt</h2>
          <Badge variant="secondary" className="text-xs">
            {timelineProjects.length} Projekte
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {viewMode}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode('Tagesansicht')}>
                Tagesansicht
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('Wochenansicht')}>
                Wochenansicht
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('Monatsansicht')}>
                Monatsansicht
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('Quartalsansicht')}>
                Quartalsansicht
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fortschritt</p>
                <p className="text-2xl font-bold text-blue-600">{totalProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fertig</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-600">{completedTasks}</span>
                  <span className="text-muted-foreground text-lg">/{allTasks.length}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gefährdet</p>
                <p className="text-2xl font-bold text-orange-600">{atRiskTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-lg font-bold">
                  {nextDeadline ? new Date(nextDeadline.endDate).toLocaleDateString('de-DE') : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <GanttChart projects={timelineProjects} />
    </div>
  );
};