import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Target,
  Users,
  RefreshCw
} from 'lucide-react';
import { EnterpriseProject } from '@/types/project-enterprise';

interface PredictiveAnalyticsPanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const PredictiveAnalyticsPanel: React.FC<PredictiveAnalyticsPanelProps> = ({
  project,
  onUpdate
}) => {
  // Dummy-Daten für Predictive Analytics
  const predictions = [
    {
      type: 'delay',
      title: 'Verzögerungsrisiko',
      probability: project.delay_probability * 100,
      icon: Clock,
      color: 'text-orange-500',
      factors: [
        { factor: 'Team Auslastung', impact: 0.3 },
        { factor: 'Fehlende Skills', impact: 0.2 },
        { factor: 'Dependencies', impact: 0.1 }
      ]
    },
    {
      type: 'cost_overrun',
      title: 'Budgetüberschreitung',
      probability: project.cost_overrun_probability * 100,
      icon: DollarSign,
      color: 'text-red-500',
      factors: [
        { factor: 'Scope Creep', impact: 0.4 },
        { factor: 'Ressourcenkosten', impact: 0.2 },
        { factor: 'Externe Faktoren', impact: 0.1 }
      ]
    },
    {
      type: 'success',
      title: 'Erfolgsprognose',
      probability: project.success_prediction * 100,
      icon: Target,
      color: 'text-green-500',
      factors: [
        { factor: 'Team Performance', impact: 0.3 },
        { factor: 'Stakeholder Zufriedenheit', impact: 0.2 },
        { factor: 'Qualitätsmetriken', impact: 0.2 }
      ]
    }
  ];

  const getRiskLevel = (probability: number) => {
    if (probability >= 70) return { level: 'Hoch', variant: 'destructive' as const };
    if (probability >= 40) return { level: 'Mittel', variant: 'secondary' as const };
    return { level: 'Niedrig', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      {/* AI Predictions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictions.map((prediction, index) => {
          const risk = getRiskLevel(prediction.probability);
          const Icon = prediction.icon;
          
          return (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-6 w-6 ${prediction.color}`} />
                  <Badge variant={risk.variant}>{risk.level}</Badge>
                </div>
                <h3 className="font-medium text-sm mb-2">{prediction.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Wahrscheinlichkeit</span>
                    <span className="font-medium">{prediction.probability.toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.probability} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risikofaktoren Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index}>
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <prediction.icon className={`h-4 w-4 ${prediction.color}`} />
                    {prediction.title}
                  </h4>
                  <div className="space-y-2 ml-6">
                    {prediction.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="flex justify-between items-center">
                        <span className="text-sm">{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={factor.impact * 100} className="w-16 h-2" />
                          <span className="text-xs font-medium w-10">
                            {(factor.impact * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              KI-Empfehlungen
            </CardTitle>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.ai_recommendations && project.ai_recommendations.length > 0 ? (
                project.ai_recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        recommendation.priority === 'critical' ? 'destructive' :
                        recommendation.priority === 'high' ? 'secondary' : 'default'
                      } className="text-xs">
                        {recommendation.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {recommendation.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    {recommendation.estimated_impact && (
                      <p className="text-xs font-medium text-primary">
                        Erwarteter Impact: {recommendation.estimated_impact}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Keine Empfehlungen verfügbar</p>
                  <p className="text-sm">KI analysiert Ihr Projekt für neue Insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Metrics Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <p className="text-sm font-medium text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold">{project.roi_actual.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                Ziel: {project.roi_target.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm font-medium text-muted-foreground">Produktivität</p>
              <p className="text-2xl font-bold">{project.productivity_score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Score (0-100)</p>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm font-medium text-muted-foreground">Qualität</p>
              <p className="text-2xl font-bold">{project.quality_score.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Score (0-100)</p>
            </div>
            <div className="text-center p-4 border rounded">
              <p className="text-sm font-medium text-muted-foreground">Team Effizienz</p>
              <p className="text-2xl font-bold">
                {project.estimated_hours > 0 ? 
                  ((project.logged_hours / project.estimated_hours) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">
                {project.logged_hours}h / {project.estimated_hours}h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecasting Accuracy */}
      {project.forecast_accuracy > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Prognose Genauigkeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Aktuelle Genauigkeit</span>
                  <span className="font-medium">{(project.forecast_accuracy * 100).toFixed(1)}%</span>
                </div>
                <Progress value={project.forecast_accuracy * 100} className="h-3" />
              </div>
              <Badge variant={project.forecast_accuracy >= 0.8 ? 'default' : 'secondary'}>
                {project.forecast_accuracy >= 0.8 ? 'Sehr gut' : 
                 project.forecast_accuracy >= 0.6 ? 'Gut' : 'Verbesserungsbedarf'}
              </Badge>
            </div>
            {project.completion_prediction && (
              <p className="text-sm text-muted-foreground mt-3">
                Voraussichtlicher Abschluss: {new Date(project.completion_prediction).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};