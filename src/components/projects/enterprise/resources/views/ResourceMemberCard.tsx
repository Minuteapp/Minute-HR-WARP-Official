import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, MapPin, Mail, Phone, User, Calendar, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProjectAssignment {
  id: string;
  projectId: string;
  name: string;
  role: string;
  hoursPerWeek: number;
  percentage: number;
  startDate: string;
  endDate: string;
}

interface Skill {
  name: string;
  level: 'expert' | 'senior' | 'medior' | 'junior';
  years: number;
}

interface ResourceMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  utilizationPercent: number;
  bookedHours: number;
  maxHours: number;
  hourlyRate: number;
  skills: Skill[];
  projects: ProjectAssignment[];
  availability: {
    thisWeek: number;
    nextWeek: number;
    nextMonth: number;
  };
  performance: {
    tasks: number;
    punctuality: number;
    quality: number;
  };
}

interface ResourceMemberCardProps {
  member: ResourceMember;
}

const getUtilizationColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-100 text-red-700 border-red-200';
  if (percent >= 71) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const getProgressColor = (percent: number) => {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 71) return 'bg-yellow-500';
  return 'bg-green-500';
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const ResourceMemberCard = ({ member }: ResourceMemberCardProps) => {
  const weeklyCost = member.bookedHours * member.hourlyRate;
  const displayedSkills = member.skills.slice(0, 3);
  const remainingSkills = member.skills.length - 3;

  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <Badge variant="outline" className={`${getUtilizationColor(member.utilizationPercent)} border`}>
                  {member.utilizationPercent}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Kontakt */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {member.location}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {member.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {member.phone}
          </span>
        </div>

        {/* Kapazität */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">Kapazität</span>
            <span className="text-sm text-muted-foreground">{member.bookedHours}h / {member.maxHours}h pro Woche</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProgressColor(member.utilizationPercent)} transition-all`}
              style={{ width: `${Math.min(member.utilizationPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Projekt-Zuweisungen */}
        {member.projects.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Projekt-Zuweisungen:</p>
            <div className="space-y-2">
              {member.projects.map((project) => (
                <div key={project.id} className="bg-muted/50 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{project.name}</span>
                      <Badge variant="outline" className="text-xs">{project.role}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{project.hoursPerWeek}h/Woche</span>
                      <span className="text-muted-foreground">{project.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Grid */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
          {/* Skills */}
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
              <User className="h-3 w-3" />
              Skills
            </div>
            <div className="flex flex-wrap gap-1">
              {displayedSkills.map((skill) => (
                <Badge 
                  key={skill.name} 
                  variant="outline" 
                  className="bg-green-100 text-green-700 border-green-200 text-xs"
                >
                  {skill.name}
                </Badge>
              ))}
              {remainingSkills > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingSkills}
                </Badge>
              )}
            </div>
          </div>

          {/* Verfügbarkeit */}
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
              <Calendar className="h-3 w-3" />
              Verfügbarkeit
            </div>
            <div className="text-xs space-y-0.5">
              <p className="text-muted-foreground">Diese Woche: <span className="text-foreground font-medium">{member.availability.thisWeek}h</span></p>
              <p className="text-muted-foreground">Nächste Woche: <span className="text-foreground font-medium">{member.availability.nextWeek}h</span></p>
              <p className="text-muted-foreground">Nächster Monat: <span className="text-foreground font-medium">{member.availability.nextMonth}h</span></p>
            </div>
          </div>

          {/* Performance */}
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground mb-2">
              <BarChart3 className="h-3 w-3" />
              Performance
            </div>
            <div className="text-xs space-y-0.5">
              <p className="text-muted-foreground">Aufgaben: <span className="text-foreground font-medium">{member.performance.tasks}</span></p>
              <p className="text-muted-foreground">Pünktlichkeit: <span className="text-foreground font-medium">{member.performance.punctuality}%</span></p>
              <p className="text-muted-foreground">Qualität: <span className="text-foreground font-medium">{member.performance.quality}%</span></p>
            </div>
          </div>
        </div>

        {/* Kosten */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Wöchentliche Kosten:</span>
          <span className="font-semibold text-foreground">
            €{weeklyCost.toLocaleString('de-DE')} (€{member.hourlyRate}/h)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMemberCard;
