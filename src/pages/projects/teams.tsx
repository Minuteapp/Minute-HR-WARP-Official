
import React from 'react';
import { Users, Plus, UserPlus, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useProjects } from '@/hooks/projects/useProjects';

export default function ProjectTeamsPage() {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();

  // Extrahiere Team-Informationen aus den Projekten
  const teams = React.useMemo(() => {
    const teamMap = new Map();
    
    projects.forEach(project => {
      if (project.team_members && project.team_members.length > 0) {
        project.team_members.forEach(memberId => {
          if (!teamMap.has(memberId)) {
            teamMap.set(memberId, {
              id: memberId,
              name: `Team Mitglied ${memberId.slice(0, 8)}`,
              members: [memberId],
              projects: 0,
              color: 'bg-blue-100 text-blue-800'
            });
          }
          teamMap.get(memberId).projects += 1;
        });
      }
    });

    return Array.from(teamMap.values());
  }, [projects]);

  return (
    <StandardPageLayout
      title="Projektteams"
      subtitle="Verwalten Sie Ihre Projektteams und Mitglieder"
      actions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neues Team
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Teams vorhanden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Projekte mit Team-Mitgliedern, um Teams zu verwalten.
              </p>
              <Button onClick={() => navigate('/projects/new')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Neues Projekt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.color}`}>
                      {team.projects} Projekte
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{team.members.length} Mitglieder</span>
                    </div>
                    <div className="space-y-1">
                      {team.members.map((member, index) => (
                        <div key={index} className="text-sm text-foreground">
                          {member}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      Bearbeiten
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <UserPlus className="h-3 w-3" />
                      Mitglied
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
