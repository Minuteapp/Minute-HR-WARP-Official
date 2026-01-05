
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Mail, 
  Phone,
  Crown,
  Shield,
  User
} from 'lucide-react';

interface ProjectTeamTabProps {
  project: any;
  teamMembers: any[];
}

export const ProjectTeamTab: React.FC<ProjectTeamTabProps> = ({ project, teamMembers = [] }) => {
  // Nur echte Daten aus der Datenbank
  const displayMembers = teamMembers;

  const getRoleIcon = (role: string) => {
    if (role.includes('leiter') || role.includes('Leader')) {
      return <Crown className="h-4 w-4 text-yellow-600" />;
    }
    if (role.includes('Senior')) {
      return <Shield className="h-4 w-4 text-blue-600" />;
    }
    return <User className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Team-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team-Mitglieder</p>
                <p className="text-2xl font-bold">{displayMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Mitglieder</p>
                <p className="text-2xl font-bold">{displayMembers.filter(m => m.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rollen</p>
                <p className="text-2xl font-bold">{new Set(displayMembers.map(m => m.role)).size}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team-Mitglieder */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team-Mitglieder
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Mitglied hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Team-Mitglieder zugewiesen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{member.email}</span>
                    </div>
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                    >
                      {member.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
