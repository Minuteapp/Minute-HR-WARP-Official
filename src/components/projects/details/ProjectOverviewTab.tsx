
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Clock,
  CheckSquare
} from 'lucide-react';

interface ProjectOverviewTabProps {
  project: any;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      {/* Projekt-Status Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fortschritt</p>
                <p className="text-2xl font-bold">{project.progress || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={project.progress || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team-Größe</p>
                <p className="text-2xl font-bold">{project.teamSize || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offene Aufgaben</p>
                <p className="text-2xl font-bold">{project.openTasks || 0}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projekt-Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Projektdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Beschreibung</h3>
            <p className="text-gray-600 mt-1">
              {project.description || 'Keine Beschreibung verfügbar'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Startdatum</h4>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Nicht festgelegt'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Enddatum</h4>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Nicht festgelegt'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Status</h4>
            <Badge 
              variant={project.status === 'active' ? 'default' : 'secondary'}
              className="mt-1"
            >
              {project.status === 'active' ? 'Aktiv' : project.status || 'Unbekannt'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
