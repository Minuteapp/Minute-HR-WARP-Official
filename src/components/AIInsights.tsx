import React from 'react';
import { Brain, AlertCircle, Lightbulb, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useEnhancedTasks } from './hooks/useEnhancedTasks';
import { ExtendedTask } from './hooks/useEnhancedTasks';

interface AIInsightsProps {
  task?: ExtendedTask;
  projectId?: string;
}

export function AIInsights({ task, projectId }: AIInsightsProps) {
  const { analyzeProjectRisk } = useEnhancedTasks('admin');

  const projectAnalysis = projectId ? analyzeProjectRisk(projectId) : null;

  if (!task?.aiInsights && !projectAnalysis) {
    return null;
  }

  const getRiskBadgeColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-purple-600" />
        <h3 className="font-medium text-gray-900">KI-Analysen & Empfehlungen</h3>
      </div>

      {/* Task-specific AI insights */}
      {task?.aiInsights && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <AlertCircle className="h-4 w-4" />
              <span>Aufgaben-Analyse</span>
              <Badge className={getRiskBadgeColor(task.riskLevel)}>
                {task.riskLevel} Risiko
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Impact */}
            <div>
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                Auswirkung auf Projekt
              </h4>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {task.aiInsights.impactOnProject}
              </p>
            </div>

            {/* Roadmap Impact */}
            <div>
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                Auswirkung auf Roadmap
              </h4>
              <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                {task.aiInsights.impactOnRoadmap}
              </p>
            </div>

            {/* AI Suggestions */}
            {task.aiInsights.suggestions.length > 0 && (
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  KI-Empfehlungen
                </h4>
                <div className="space-y-2">
                  {task.aiInsights.suggestions.map((suggestion, index) => (
                    <Alert key={index} className="bg-green-50 border-green-200">
                      <AlertDescription className="text-sm text-green-800">
                        {suggestion}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Risk Analysis */}
      {projectAnalysis && projectAnalysis.riskyTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <AlertCircle className="h-4 w-4" />
              <span>Projekt-Risikoanalyse</span>
              <Badge className={getRiskBadgeColor(projectAnalysis.riskLevel)}>
                {projectAnalysis.riskLevel} Risiko
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Summary */}
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {projectAnalysis.riskyTasks.length} risikoreiche Aufgaben identifiziert
              </p>
              
              {/* Risky Tasks */}
              <div className="space-y-2">
                {projectAnalysis.riskyTasks.slice(0, 3).map((riskyTask) => (
                  <div key={riskyTask.id} className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{riskyTask.title}</span>
                    <Badge className={getRiskBadgeColor(riskyTask.riskLevel)}>
                      {riskyTask.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {projectAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Empfohlene Maßnahmen
                </h4>
                <div className="space-y-2">
                  {projectAnalysis.recommendations.map((rec, index) => (
                    <Alert key={index} className="bg-yellow-50 border-yellow-200">
                      <AlertDescription className="text-sm text-yellow-800">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}