import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface ProjectTeamTabNewProps {
  project: any;
}

export const ProjectTeamTabNew: React.FC<ProjectTeamTabNewProps> = ({ project }) => {
  const teamMembers: { id: number; name: string; role: string; badge: string; badgeColor: string; utilization: number; avatar: string }[] = [];

  const resourceUtilization = [
    { name: 'Entwickler', utilization: 85 },
    { name: 'Designer', utilization: 60 },
    { name: 'Analysten', utilization: 70 },
  ];

  const skills = [
    'React', 'TypeScript', 'Node.js', 'Cloud', 'Python', 'SQL', 'Figma', 'Agile'
  ];

  return (
    <div className="space-y-6">
      {/* Projektteam */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Projektteam ({teamMembers.length} Mitglieder)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{member.name}</p>
                      <Badge className={`${member.badgeColor} text-xs font-normal`}>
                        {member.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{member.utilization}%</span>
                  <div className="w-20">
                    <Progress value={member.utilization} className="h-2 [&>div]:bg-green-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zwei-Spalten Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ressourcen-Auslastung */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Ressourcen-Auslastung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceUtilization.map((resource) => (
              <div key={resource.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{resource.name}</span>
                  <span className="text-sm font-medium">{resource.utilization}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500" 
                    style={{ width: `${resource.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skill-Verteilung */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Skill-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="bg-muted hover:bg-muted text-sm py-1 px-3"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};