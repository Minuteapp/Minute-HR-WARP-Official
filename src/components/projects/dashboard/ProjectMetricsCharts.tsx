import { useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '@/types/project.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock,
  Target,
  Users,
  Calendar,
  Zap
} from 'lucide-react';

interface ProjectMetricsChartsProps {
  projects: Project[];
}

export const ProjectMetricsCharts = ({ projects }: ProjectMetricsChartsProps) => {
  const [selectedChart, setSelectedChart] = useState<'status' | 'priority' | 'timeline' | 'performance'>('status');

  // Daten für verschiedene Charts
  const getStatusData = () => {
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'Aktiv', value: statusCounts.active || 0, color: 'bg-blue-500', percentage: 0 },
      { label: 'Abgeschlossen', value: statusCounts.completed || 0, color: 'bg-green-500', percentage: 0 },
      { label: 'Wartend', value: statusCounts.pending || 0, color: 'bg-yellow-500', percentage: 0 },
      { label: 'Archiviert', value: statusCounts.archived || 0, color: 'bg-gray-500', percentage: 0 }
    ].map(item => ({
      ...item,
      percentage: projects.length > 0 ? (item.value / projects.length) * 100 : 0
    }));
  };

  const getPriorityData = () => {
    const priorityCounts = projects.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { label: 'Hoch', value: priorityCounts.high || 0, color: 'bg-red-500', percentage: 0 },
      { label: 'Mittel', value: priorityCounts.medium || 0, color: 'bg-orange-500', percentage: 0 },
      { label: 'Niedrig', value: priorityCounts.low || 0, color: 'bg-green-500', percentage: 0 }
    ].map(item => ({
      ...item,
      percentage: projects.length > 0 ? (item.value / projects.length) * 100 : 0
    }));
  };

  const getPerformanceMetrics = () => {
    const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0;
    const onTimeProjects = projects.filter(p => p.status === 'completed').length;
    const totalTeamMembers = new Set(projects.flatMap(p => p.team_members || [])).size;
    
    return [
      { label: 'Durchschnittl. Fortschritt', value: `${Math.round(avgProgress)}%`, icon: TrendingUp, color: 'text-blue-500' },
      { label: 'Termingerecht', value: onTimeProjects, icon: Clock, color: 'text-green-500' },
      { label: 'Team-Mitglieder', value: totalTeamMembers, icon: Users, color: 'text-purple-500' },
      { label: 'Aktive Sprints', value: '12', icon: Zap, color: 'text-orange-500' }
    ];
  };

  const chartTypes = [
    { id: 'status', label: 'Status', icon: PieChart },
    { id: 'priority', label: 'Priorität', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

  const renderBarChart = (data: any[]) => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.label}</span>
            <Badge variant="secondary">{item.value}</Badge>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${item.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPerformanceMetrics = () => {
    const metrics = getPerformanceMetrics();
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${metric.color}`} />
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderTimelineChart = () => (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-2" />
        <p>Timeline-Visualisierung wird entwickelt</p>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (selectedChart) {
      case 'status':
        return renderBarChart(getStatusData());
      case 'priority':
        return renderBarChart(getPriorityData());
      case 'performance':
        return renderPerformanceMetrics();
      case 'timeline':
        return renderTimelineChart();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Projekt Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Detaillierte Einblicke in Ihre Projektdaten
        </p>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={selectedChart === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedChart(type.id as any)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Chart Content */}
      <motion.div
        key={selectedChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[200px]"
      >
        {renderChart()}
      </motion.div>
    </div>
  );
};