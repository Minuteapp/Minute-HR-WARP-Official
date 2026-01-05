import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface ProjectRisksTabNewProps {
  project: any;
}

export const ProjectRisksTabNew: React.FC<ProjectRisksTabNewProps> = ({ project }) => {
  const risks = [
    { 
      id: 1, 
      name: 'Ressourcenengpass bei Entwicklern', 
      probability: 'Hoch', 
      impact: 'Mittel', 
      level: 'high',
      description: 'Gefahr von Verzögerungen durch fehlende Entwicklerkapazitäten'
    },
    { 
      id: 2, 
      name: 'Budget-Überschreitung Personal', 
      probability: 'Mittel', 
      impact: 'Hoch', 
      level: 'medium',
      description: 'Personalkosten könnten das geplante Budget übersteigen'
    },
    { 
      id: 3, 
      name: 'Technische Abhängigkeiten', 
      probability: 'Niedrig', 
      impact: 'Hoch', 
      level: 'low',
      description: 'Abhängigkeiten von Drittanbieter-APIs und -Services'
    },
    { 
      id: 4, 
      name: 'Scope Creep', 
      probability: 'Mittel', 
      impact: 'Mittel', 
      level: 'medium',
      description: 'Unkontrollierte Erweiterung des Projektumfangs'
    },
  ];

  const issues = [
    { 
      id: 1, 
      name: 'Deployment-Pipeline blockiert', 
      assignee: 'Jan P.', 
      due: '15.01.2025', 
      level: 'critical',
      description: 'CI/CD Pipeline benötigt dringende Wartung'
    },
    { 
      id: 2, 
      name: 'API-Dokumentation unvollständig', 
      assignee: 'Anna M.', 
      due: '18.01.2025', 
      level: 'normal',
      description: 'Fehlende Dokumentation für neue Endpoints'
    },
    { 
      id: 3, 
      name: 'Performance-Probleme im Staging', 
      assignee: 'Max B.', 
      due: '20.01.2025', 
      level: 'critical',
      description: 'Langsame Ladezeiten bei großen Datenmengen'
    },
  ];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-red-500 text-white text-xs">Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500 text-white text-xs">Mittel</Badge>;
      case 'low':
        return <Badge className="bg-green-500 text-white text-xs">Niedrig</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{level}</Badge>;
    }
  };

  const getIssueBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return <Badge className="bg-red-500 text-white text-xs">Kritisch</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Normal</Badge>;
    }
  };

  const getIssueColor = (level: string) => {
    return level === 'critical' ? 'bg-red-500' : 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Identifizierte Risiken */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Identifizierte Risiken ({risks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk) => (
              <div key={risk.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{risk.name}</span>
                    {getRiskBadge(risk.level)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Wahrscheinlichkeit: <strong>{risk.probability}</strong></span>
                    <span>Impact: <strong>{risk.impact}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues & Probleme */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Issues & Probleme ({issues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${getIssueColor(issue.level)}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{issue.name}</span>
                    {getIssueBadge(issue.level)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Zugewiesen: <strong>{issue.assignee}</strong></span>
                    <span>Fällig: <strong>{issue.due}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};