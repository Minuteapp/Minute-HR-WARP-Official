
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  UserPlus,
  Crown,
  Shield,
  User,
  Mail,
  Calendar
} from 'lucide-react';

interface ProjectTeamManagementProps {
  projectId: string;
  projectName: string;
}

export const ProjectTeamManagement: React.FC<ProjectTeamManagementProps> = ({
  projectId,
  projectName
}) => {
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock-Daten für Team-Mitglieder
  const teamMembers = [
    {
      id: '1',
      name: 'Anna Schmidt',
      email: 'anna.schmidt@example.com',
      role: 'Projektleiter',
      avatar: null,
      status: 'active',
      joinDate: '2024-01-01',
      workload: 100
    },
    {
      id: '2',
      name: 'Michael Weber',
      email: 'michael.weber@example.com',
      role: 'Senior Entwickler',
      avatar: null,
      status: 'active',
      joinDate: '2024-01-02',
      workload: 80
    },
    {
      id: '3',
      name: 'Sarah Müller',
      email: 'sarah.mueller@example.com',
      role: 'UX Designer',
      avatar: null,
      status: 'active',
      joinDate: '2024-01-05',
      workload: 60
    },
    {
      id: '4',
      name: 'Thomas Berg',
      email: 'thomas.berg@example.com',
      role: 'Entwickler',
      avatar: null,
      status: 'inactive',
      joinDate: '2024-01-10',
      workload: 40
    }
  ];

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const totalWorkload = teamMembers.reduce((sum, member) => sum + member.workload, 0);
  const avgWorkload = totalWorkload / teamMembers.length;

  const getRoleIcon = (role: string) => {
    if (role.includes('leiter') || role.includes('Leader')) {
      return <Crown className="h-4 w-4 text-yellow-600" />;
    }
    if (role.includes('Senior')) {
      return <Shield className="h-4 w-4 text-blue-600" />;
    }
    return <User className="h-4 w-4 text-gray-600" />;
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Team-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team-Mitglieder</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
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
                <p className="text-2xl font-bold">{activeMembers}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ø Auslastung</p>
                <p className="text-2xl font-bold">{avgWorkload.toFixed(0)}%</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rollen</p>
                <p className="text-2xl font-bold">{new Set(teamMembers.map(m => m.role)).size}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team-Mitglieder Liste */}
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
          <div className="space-y-4">
            {teamMembers.map((member) => (
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
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${getWorkloadColor(member.workload)}`}>
                      {member.workload}%
                    </span>
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                    >
                      {member.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Seit {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rollen-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Rollen-Verteilung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Projektleitung</h4>
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-500">Mitglied</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Senior-Rollen</h4>
              </div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-500">Mitglied</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium">Team-Mitglieder</h4>
              </div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-gray-500">Mitglieder</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auslastungs-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Team-Auslastung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <span className="font-medium">{member.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        member.workload >= 90 ? 'bg-red-500' :
                        member.workload >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${member.workload}%` }}
                    ></div>
                  </div>
                  <span className={`font-medium ${getWorkloadColor(member.workload)}`}>
                    {member.workload}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
