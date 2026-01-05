
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Plus, AlertCircle } from 'lucide-react';

interface Dependency {
  id: string;
  name: string;
  type: 'blocks' | 'blocked_by' | 'related';
  status: 'pending' | 'in_progress' | 'completed';
}

interface ProjectDependenciesProps {
  projectId: string;
}

export const ProjectDependencies: React.FC<ProjectDependenciesProps> = ({ projectId }) => {
  const [dependencies] = useState<Dependency[]>([
    {
      id: '1',
      name: 'API Integration fertigstellen',
      type: 'blocks',
      status: 'in_progress'
    },
    {
      id: '2',
      name: 'Design System Update',
      type: 'blocked_by',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Mobile App Entwicklung',
      type: 'related',
      status: 'in_progress'
    }
  ]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blocks':
        return 'Blockiert';
      case 'blocked_by':
        return 'Blockiert von';
      case 'related':
        return 'Verwandt';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blocks':
        return 'bg-red-100 text-red-800';
      case 'blocked_by':
        return 'bg-orange-100 text-orange-800';
      case 'related':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'pending':
        return 'Ausstehend';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Projekt-Abhängigkeiten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dependencies.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Abhängigkeiten definiert</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dependencies.map((dependency) => (
                <div key={dependency.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {dependency.type === 'blocks' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <div>
                      <p className="font-medium">{dependency.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getTypeColor(dependency.type)}>
                          {getTypeLabel(dependency.type)}
                        </Badge>
                        <Badge className={getStatusColor(dependency.status)}>
                          {getStatusLabel(dependency.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Abhängigkeit hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
