
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

interface MilestoneListProps {
  projectId: string;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({ projectId }) => {
  const [milestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Projektplanung abschließen',
      description: 'Vollständige Planung und Ressourcenzuteilung',
      dueDate: '2024-02-15',
      status: 'completed',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Erste Prototyp-Phase',
      description: 'Entwicklung des ersten funktionsfähigen Prototyps',
      dueDate: '2024-03-01',
      status: 'in-progress',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Benutzertests durchführen',
      description: 'Umfassende Tests mit Endnutzern',
      dueDate: '2024-03-15',
      status: 'pending',
      priority: 'medium'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Meilensteine</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Meilenstein hinzufügen
        </Button>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Keine Meilensteine vorhanden. Erstellen Sie den ersten Meilenstein für dieses Projekt.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(milestone.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{milestone.dueDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getPriorityColor(milestone.priority)}>
                    {milestone.priority === 'high' ? 'Hoch' : milestone.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status === 'completed' ? 'Abgeschlossen' : 
                     milestone.status === 'in-progress' ? 'In Bearbeitung' :
                     milestone.status === 'overdue' ? 'Überfällig' : 'Ausstehend'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
