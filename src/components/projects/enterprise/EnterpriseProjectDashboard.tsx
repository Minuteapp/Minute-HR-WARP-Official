import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  Clock, 
  Users, 
  Award,
  Brain,
  Shield,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { BudgetOverviewPanel } from './dashboard/BudgetOverviewPanel';
import { OKRsPanel } from './dashboard/OKRsPanel';
import { PredictiveAnalyticsPanel } from './dashboard/PredictiveAnalyticsPanel';
import { SkillsWorkforcePanel } from './dashboard/SkillsWorkforcePanel';
import { ComplianceRiskPanel } from './dashboard/ComplianceRiskPanel';
import { BonusIncentivesPanel } from './dashboard/BonusIncentivesPanel';
import { EnterpriseProject } from '@/types/project-enterprise';

interface EnterpriseProjectDashboardProps {
  project: EnterpriseProject;
  onProjectUpdate?: (project: EnterpriseProject) => void;
}

export const EnterpriseProjectDashboard: React.FC<EnterpriseProjectDashboardProps> = ({
  project,
  onProjectUpdate
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Berechne Key Metrics
  const budgetUtilization = project.actual_cost / (project.budget_breakdown.reduce((acc, cat) => acc + cat.allocated_amount, 0) || 1) * 100;
  const progressPercentage = project.okr_progress || 0;
  const riskLevel = Math.max(project.delay_probability, project.cost_overrun_probability) * 100;
  
  const getRiskBadgeColor = (risk: number) => {
    if (risk >= 70) return 'destructive';
    if (risk >= 40) return 'secondary';
    return 'default';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'at_risk': return 'destructive';
      case 'blocked': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Projekt Status */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projektstatus</p>
                <Badge variant={getStatusColor(project.status)} className="mt-1">
                  {project.status}
                </Badge>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Strategische Wichtigkeit: {project.strategic_importance}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budget Status */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
                <p className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={budgetUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {project.actual_cost.toLocaleString()}€ von {project.budget_breakdown.reduce((acc, cat) => acc + cat.allocated_amount, 0).toLocaleString()}€
            </p>
          </CardContent>
        </Card>

        {/* OKR Progress */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OKR Fortschritt</p>
                <p className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {project.objectives?.length || 0} Ziele definiert
            </p>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risiko Level</p>
                <Badge variant={getRiskBadgeColor(riskLevel)} className="mt-1">
                  {riskLevel.toFixed(1)}%
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Verzögerung:</span>
                <span>{(project.delay_probability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Budgetüberschreitung:</span>
                <span>{(project.cost_overrun_probability * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations (falls vorhanden) */}
      {project.ai_recommendations && project.ai_recommendations.length > 0 && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              KI-Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.ai_recommendations.slice(0, 4).map((rec, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-start gap-2">
                    <Badge variant={rec.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
          </TabsTrigger>
          <TabsTrigger value="okrs" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">OKRs</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="workforce" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Workforce</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mini Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Budget Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.budget_breakdown.slice(0, 3).map((category, index) => {
                    const utilization = (category.spent_amount / category.allocated_amount) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category.category}</span>
                          <span>{utilization.toFixed(1)}%</span>
                        </div>
                        <Progress value={utilization} className="h-2" />
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" 
                  onClick={() => setActiveTab('budget')}>
                  Vollständiges Budget anzeigen
                </Button>
              </CardContent>
            </Card>

            {/* Mini OKRs Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  OKRs Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.objectives?.slice(0, 3).map((objective, index) => {
                    const progress = (objective.current_value / (objective.target_value || 1)) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate">{objective.title}</span>
                          <Badge variant={objective.status === 'completed' ? 'default' : 'secondary'}>
                            {objective.status}
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4"
                  onClick={() => setActiveTab('okrs')}>
                  Alle OKRs verwalten
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <BudgetOverviewPanel project={project} onUpdate={onProjectUpdate} />
        </TabsContent>

        <TabsContent value="okrs">
          <OKRsPanel project={project} onUpdate={onProjectUpdate} />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveAnalyticsPanel project={project} onUpdate={onProjectUpdate} />
        </TabsContent>

        <TabsContent value="workforce">
          <SkillsWorkforcePanel project={project} onUpdate={onProjectUpdate} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceRiskPanel project={project} onUpdate={onProjectUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};