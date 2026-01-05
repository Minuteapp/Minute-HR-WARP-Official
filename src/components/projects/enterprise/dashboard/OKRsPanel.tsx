import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Edit
} from 'lucide-react';
import { EnterpriseProject, ProjectObjective, ProjectKeyResult } from '@/types/project-enterprise';

interface OKRsPanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const OKRsPanel: React.FC<OKRsPanelProps> = ({
  project,
  onUpdate
}) => {
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);

  // Berechne OKR Metriken
  const totalObjectives = project.objectives?.length || 0;
  const completedObjectives = project.objectives?.filter(obj => obj.status === 'completed').length || 0;
  const averageProgress = project.okr_progress || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'default';
      case 'at_risk': return 'destructive';
      case 'behind': return 'destructive';
      default: return 'secondary';
    }
  };

  const getObjectiveProgress = (objective: ProjectObjective) => {
    if (!objective.target_value) return 0;
    return Math.min(100, (objective.current_value / objective.target_value) * 100);
  };

  return (
    <div className="space-y-6">
      {/* OKR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamt OKRs</p>
                <p className="text-2xl font-bold">{totalObjectives}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abgeschlossen</p>
                <p className="text-2xl font-bold">{completedObjectives}</p>
                <p className="text-xs text-muted-foreground">
                  {totalObjectives > 0 ? ((completedObjectives / totalObjectives) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Durchschnittlicher Fortschritt</p>
                <p className="text-2xl font-bold">{averageProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OKRs Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectives
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Neues Ziel
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.objectives && project.objectives.length > 0 ? (
                project.objectives.map((objective, index) => {
                  const progress = getObjectiveProgress(objective);
                  const isOverdue = objective.due_date && new Date(objective.due_date) < new Date();
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedObjective === objective.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedObjective(objective.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{objective.title}</h4>
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                          <Badge variant={getStatusColor(objective.status)}>
                            {objective.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {objective.description && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {objective.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Fortschritt: {progress.toFixed(1)}%</span>
                          <span>
                            {objective.current_value} / {objective.target_value} {objective.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {objective.due_date && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Fällig: {new Date(objective.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Keine Objectives definiert</p>
                  <p className="text-sm">Erstellen Sie Ihre ersten OKRs für dieses Projekt</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Key Results
            </CardTitle>
            {selectedObjective && (
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Neues KR
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedObjective ? (
              <div className="space-y-4">
                {/* Hier würden die Key Results für das ausgewählte Objective angezeigt */}
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Key Results für ausgewähltes Objective</p>
                  <p className="text-sm">Verwalten Sie die messbaren Ergebnisse</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Wählen Sie ein Objective aus</p>
                <p className="text-sm">Klicken Sie links auf ein Ziel, um die Key Results zu sehen</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OKR Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            OKR Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Vereinfachte Timeline Darstellung */}
            {project.objectives && project.objectives.filter(obj => obj.due_date).length > 0 ? (
              <div className="space-y-3">
                {project.objectives
                  .filter(obj => obj.due_date)
                  .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                  .map((objective, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{objective.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Fällig: {new Date(objective.due_date!).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(objective.status)}>
                        {objective.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Keine Deadlines gesetzt</p>
                <p className="text-sm">Fügen Sie Fälligkeitstermine zu Ihren Objectives hinzu</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};