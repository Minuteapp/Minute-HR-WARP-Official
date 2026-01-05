
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Edit, 
  Archive,
  Trash2,
  Users,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';

interface ProjectDetailsTabProps {
  project: any;
  setActiveTab: (tab: string) => void;
}

export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project, setActiveTab }) => {
  return (
    <div className="space-y-6">
      {/* Projekt-Informationen */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Projekt-Details
            </CardTitle>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Projektname</label>
                <p className="mt-1 text-sm text-gray-900">{project.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Beschreibung</label>
                <p className="mt-1 text-sm text-gray-900">{project.description || 'Keine Beschreibung verfügbar'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status === 'active' ? 'Aktiv' : project.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Priorität</label>
                <div className="mt-1">
                  <Badge variant={
                    project.priority === 'high' ? 'destructive' : 
                    project.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {project.priority === 'high' ? 'Hoch' : 
                     project.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Startdatum</label>
                <p className="mt-1 text-sm text-gray-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Nicht festgelegt'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Enddatum</label>
                <p className="mt-1 text-sm text-gray-900">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Nicht festgelegt'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Budget</label>
                <p className="mt-1 text-sm text-gray-900">
                  {project.budget ? `€${project.budget.toLocaleString()}` : 'Nicht festgelegt'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Fortschritt</label>
                <p className="mt-1 text-sm text-gray-900">{project.progress || 0}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schnellzugriff */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('team')}
            >
              <Users className="h-6 w-6" />
              <span>Team verwalten</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('milestones')}
            >
              <Target className="h-6 w-6" />
              <span>Meilensteine</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('documents')}
            >
              <Calendar className="h-6 w-6" />
              <span>Dokumente</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => setActiveTab('modules')}
            >
              <DollarSign className="h-6 w-6" />
              <span>Module</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projekt-Aktionen */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Aktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Projekt archivieren</h4>
                <p className="text-sm text-gray-600">Projekt in das Archiv verschieben</p>
              </div>
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Archivieren
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Projekt duplizieren</h4>
                <p className="text-sm text-gray-600">Eine Kopie dieses Projekts erstellen</p>
              </div>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Duplizieren
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg border-red-200">
              <div>
                <h4 className="font-medium text-red-600">Projekt löschen</h4>
                <p className="text-sm text-gray-600">Unwiderruflich löschen (Vorsicht!)</p>
              </div>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projekt-Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Aktivität</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Erstellt am:</span>
                  <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unbekannt'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Letzte Aktualisierung:</span>
                  <span>Heute</span>
                </div>
                <div className="flex justify-between">
                  <span>Projekt-Typ:</span>
                  <span>Standard</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Ressourcen</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Team-Mitglieder:</span>
                  <span>{project.teamMembers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Offene Aufgaben:</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Dokumente:</span>
                  <span>8</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
