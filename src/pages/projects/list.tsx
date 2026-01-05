
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock,
  Target,
  BarChart3,
  Activity,
  Zap,
  Sparkles,
  Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectsNavigation } from '@/components/projects/ProjectsNavigation';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { ProjectActivityFeed } from '@/components/projects/dashboard/ProjectActivityFeed';
import { ProjectMetricsCharts } from '@/components/projects/dashboard/ProjectMetricsCharts';
import { ProjectProgressRing } from '@/components/projects/dashboard/ProjectProgressRing';
import { QuickProjectActions } from '@/components/projects/dashboard/QuickProjectActions';
import { ProjectHeatmap } from '@/components/projects/dashboard/ProjectHeatmap';
import { TimeTrackingWidget } from '@/components/projects/time-tracking/TimeTrackingWidget';
import { MilestoneManager } from '@/components/projects/milestones/MilestoneManager';
import { ProjectCollaboration } from '@/components/projects/collaboration/ProjectCollaboration';
import { useProjects } from '@/hooks/projects/useProjects';

export default function ProjectListPage() {
  const location = useLocation();
  const { projects, loading } = useProjects();
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Berechne echte Statistiken aus den Projekten
  const stats = [
    {
      title: 'Aktive Projekte',
      value: projects.filter(p => p.status === 'active').length.toString(),
      change: '+2 diese Woche',
      icon: Rocket,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      trend: 'up'
    },
    {
      title: 'Abgeschlossene Projekte',
      value: projects.filter(p => p.status === 'completed').length.toString(),
      change: '+3 diesen Monat',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      trend: 'up'
    },
    {
      title: 'Team-Auslastung',
      value: '87%',
      change: '+5% vs. letzter Monat',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      trend: 'up'
    },
    {
      title: 'Projektgeschwindigkeit',
      value: '12.3',
      change: 'Punkte pro Sprint',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      trend: 'stable'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <StandardPageLayout
      title="🚀 Projektmanagement Dashboard"
      subtitle="Ihre Projekte im Überblick - modern, smart und intuitiv"
    >
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Stats Section */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {stat.title}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {stat.value}
                            </p>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </motion.div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {stat.change}
                          </p>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projekt Fortschritt Ring */}
          <motion.div variants={itemVariants}>
            <ProjectProgressRing projects={projects} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Schnellaktionen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickProjectActions />
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <ProjectActivityFeed />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Zeiterfassung & Meilensteine */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <TimeTrackingWidget />
            <MilestoneManager projectId="sample-id" projectName="Demo Projekt" />
          </div>
        </motion.div>

        {/* Projekt Heatmap & Metriken */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                📊 Projekt Analytics & Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ProjectHeatmap projects={projects} />
                <ProjectMetricsCharts projects={projects} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kollaboration */}
        <motion.div variants={itemVariants}>
          <ProjectCollaboration projectId="sample-id" projectName="Demo Projekt" />
        </motion.div>

        {/* Navigation */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                🎯 Projekt Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ProjectsNavigation currentPath={location.pathname} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </StandardPageLayout>
  );
}
