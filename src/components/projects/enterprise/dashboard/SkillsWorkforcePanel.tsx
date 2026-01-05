import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Star,
  UserPlus,
  Settings
} from 'lucide-react';
import { EnterpriseProject } from '@/types/project-enterprise';

interface SkillsWorkforcePanelProps {
  project: EnterpriseProject;
  onUpdate?: (project: EnterpriseProject) => void;
}

export const SkillsWorkforcePanel: React.FC<SkillsWorkforcePanelProps> = ({
  project,
  onUpdate
}) => {
  // Dummy-Daten für Skills Requirements (da JSONB-Feld)
  const skillRequirements = [
    { skill_name: 'React/TypeScript', required_level: 4, allocated_hours: 120, required_hours: 160, priority: 'high' },
    { skill_name: 'Backend Development', required_level: 3, allocated_hours: 80, required_hours: 100, priority: 'medium' },
    { skill_name: 'UI/UX Design', required_level: 4, allocated_hours: 60, required_hours: 80, priority: 'high' },
    { skill_name: 'DevOps', required_level: 3, allocated_hours: 40, required_hours: 60, priority: 'medium' },
  ];

  // Dummy-Daten für Skill Gaps
  const skillGaps = [
    { skill_name: 'React/TypeScript', required_level: 4, current_level: 3, gap_severity: 'moderate' },
    { skill_name: 'UI/UX Design', required_level: 4, current_level: 2, gap_severity: 'major' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      default: return 'outline';
    }
  };

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'major': return 'destructive';
      case 'moderate': return 'secondary';
      default: return 'default';
    }
  };

  const getSkillLevelStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Workforce Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Größe</p>
                <p className="text-2xl font-bold">{project.team_members?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skill Gaps</p>
                <p className="text-2xl font-bold">{skillGaps.length}</p>
                <Badge variant={skillGaps.length > 2 ? 'destructive' : 'default'} className="mt-1">
                  {skillGaps.length > 2 ? 'Kritisch' : 'Normal'}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auslastung</p>
                <p className="text-2xl font-bold">85%</p>
                <Progress value={85} className="mt-2 h-2" />
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Überstunden</p>
                <p className="text-2xl font-bold">{project.overtime_hours}h</p>
                <p className="text-xs text-muted-foreground">
                  {((project.overtime_hours / (project.logged_hours || 1)) * 100).toFixed(1)}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Requirements & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Skill Anforderungen
            </CardTitle>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Verwalten
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillRequirements.map((skill, index) => {
                const completion = (skill.allocated_hours / skill.required_hours) * 100;
                const gap = skill.required_hours - skill.allocated_hours;
                
                return (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{skill.skill_name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {getSkillLevelStars(skill.required_level)}
                          <span className="text-xs text-muted-foreground ml-2">
                            Level {skill.required_level}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(skill.priority)}>
                        {skill.priority}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Stunden Allokation</span>
                        <span>{skill.allocated_hours}h / {skill.required_hours}h</span>
                      </div>
                      <Progress value={completion} className="h-2" />
                      {gap > 0 && (
                        <p className="text-xs text-orange-600 font-medium">
                          Fehlende Stunden: {gap}h
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Skill Gaps
            </CardTitle>
            <Button size="sm" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Rekrutierung
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.length > 0 ? (
                skillGaps.map((gap, index) => {
                  const gapLevel = gap.required_level - gap.current_level;
                  
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{gap.skill_name}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Aktuell</p>
                              <div className="flex items-center gap-1">
                                {getSkillLevelStars(gap.current_level)}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Benötigt</p>
                              <div className="flex items-center gap-1">
                                {getSkillLevelStars(gap.required_level)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant={getGapSeverityColor(gap.gap_severity)}>
                          {gap.gap_severity}
                        </Badge>
                      </div>
                      
                      <div className="bg-muted/30 p-3 rounded text-xs">
                        <p className="font-medium text-orange-600">
                          Gap: {gapLevel} Level{gapLevel !== 1 ? 's' : ''}
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Empfohlen: Training oder zusätzliche Ressourcen
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Keine Skill Gaps identifiziert</p>
                  <p className="text-sm">Ihr Team hat alle erforderlichen Skills</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Auslastungs-Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vereinfachte Heatmap-Darstellung */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, i) => {
              const intensity = Math.random(); // Dummy-Daten
              const getColor = (intensity: number) => {
                if (intensity >= 0.8) return 'bg-red-500';
                if (intensity >= 0.6) return 'bg-orange-400';
                if (intensity >= 0.4) return 'bg-yellow-400';
                if (intensity >= 0.2) return 'bg-green-400';
                return 'bg-gray-200';
              };
              
              return (
                <div 
                  key={i} 
                  className={`h-8 rounded ${getColor(intensity)} opacity-80`}
                  title={`Tag ${i + 1}: ${(intensity * 100).toFixed(0)}% Auslastung`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Niedrig</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <div className="w-3 h-3 bg-red-500 rounded"></div>
            </div>
            <span>Hoch</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};