
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Users, Calendar } from 'lucide-react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

const ProjectListPage = () => {
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Komplette Überarbeitung der Unternehmenswebsite',
      status: 'active',
      progress: 75,
      team: 5,
      deadline: '2024-07-15'
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'Entwicklung einer mobilen Anwendung',
      status: 'planning',
      progress: 25,
      team: 8,
      deadline: '2024-09-30'
    },
    {
      id: 3,
      name: 'Datenbank Migration',
      description: 'Migration auf neue Datenbankarchitektur',
      status: 'completed',
      progress: 100,
      team: 3,
      deadline: '2024-06-01'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'planning': return 'Planung';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  return (
    <StandardPageLayout
      title="Alle Projekte"
      subtitle="Vollständige Liste aller Projekte"
    >
      <div className="space-y-6">
        {/* Header mit Aktionen */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Projektübersicht</h2>
            <p className="text-gray-600">{projects.length} Projekte insgesamt</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Neues Projekt
          </Button>
        </div>

        {/* Projekt-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{project.description}</p>
                
                {/* Fortschritt */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fortschritt</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Projekt-Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.team} Mitglieder</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.deadline).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>

                {/* Aktionen */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Details
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Bearbeiten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StandardPageLayout>
  );
};

export default ProjectListPage;
