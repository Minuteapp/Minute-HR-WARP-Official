
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ProjectMilestonesTabProps {
  project: any;
  milestones: any[];
}

export const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({ project, milestones = [] }) => {
  // Keine Mock-Daten - Meilensteine werden aus der Datenbank geladen
  const displayMilestones = milestones;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Bearbeitung</Badge>;
      case 'pending':
        return <Badge variant="outline">Ausstehend</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Überfällig</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Meilensteine-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold">{displayMilestones.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold">{displayMilestones.filter(m => m.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Bearbeitung</p>
                <p className="text-2xl font-bold">{displayMilestones.filter(m => m.status === 'in-progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ausstehend</p>
                <p className="text-2xl font-bold">{displayMilestones.filter(m => m.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meilensteine-Liste */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projekt-Meilensteine
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Meilenstein
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayMilestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(milestone.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{milestone.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Fällig: {new Date(milestone.dueDate).toLocaleDateString()}
                        </div>
                        {milestone.completionDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Abgeschlossen: {new Date(milestone.completionDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {milestone.progress > 0 && milestone.status !== 'completed' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Fortschritt</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress value={milestone.progress} className="w-full" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusBadge(milestone.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zeitplan-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Meilenstein-Zeitplan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Gesamtfortschritt</span>
              <span className="font-medium">
                {Math.round((displayMilestones.filter(m => m.status === 'completed').length / displayMilestones.length) * 100)}%
              </span>
            </div>
            <Progress 
              value={(displayMilestones.filter(m => m.status === 'completed').length / displayMilestones.length) * 100} 
              className="w-full" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-medium mb-2">Nächste Meilensteine</h4>
                <div className="space-y-2">
                  {displayMilestones
                    .filter(m => m.status !== 'completed')
                    .slice(0, 3)
                    .map(milestone => (
                      <div key={milestone.id} className="flex justify-between text-sm">
                        <span>{milestone.title}</span>
                        <span className="text-gray-500">
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Kürzlich abgeschlossen</h4>
                <div className="space-y-2">
                  {displayMilestones
                    .filter(m => m.status === 'completed')
                    .slice(0, 3)
                    .map(milestone => (
                      <div key={milestone.id} className="flex justify-between text-sm">
                        <span>{milestone.title}</span>
                        <span className="text-gray-500">
                          {milestone.completionDate ? new Date(milestone.completionDate).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
