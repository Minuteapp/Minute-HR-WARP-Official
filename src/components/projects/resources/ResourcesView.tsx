import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, AlertTriangle, Target, Calendar, Download, Search, Eye, ExternalLink } from "lucide-react";
import { KPICard } from "../common/KPICard";
import { ResourceCalendarView } from "./ResourceCalendarView";
import { useState } from "react";

const resourceData = {
  kpis: {
    teamSize: 47,
    avgUtilization: 82,
    conflicts: 2,
    skillGaps: 4
  },
  conflicts: [
    {
      id: 1,
      person: 'Sarah Weber',
      issue: 'Überlastung: 105% Auslastung',
      week: 'KW 43-45',
      actions: ['Aufgaben umverteilen', 'Externe Ressource', 'Tim X zuweisen']
    },
    {
      id: 2,
      person: 'Anna Schmidt',
      issue: 'Skill-Konflikt: Schicht & Projekt',
      week: 'KW 42-10.2025',
      actions: ['Max Müller zuweisen', 'Aufgabe verschieben']
    }
  ],
  team: [
    {
      initials: 'AS',
      name: 'Anna Schmidt',
      role: 'Senior Developer',
      skills: ['React', 'TypeScript', 'Node.js'],
      capacity: '38/40h',
      utilization: 95,
      projects: ['ERP Migration', 'API Gateway'],
      status: 'verfügbar'
    },
    {
      initials: 'MM',
      name: 'Max Müller',
      role: 'UX Designer',
      skills: ['Figma', 'UI Design', 'User Research'],
      capacity: '28/40h',
      utilization: 70,
      projects: ['Mobile App Redesign', 'HR Portal'],
      status: 'verfügbar'
    },
    {
      initials: 'SW',
      name: 'Sarah Weber',
      role: 'DevOps Engineer',
      skills: ['AWS', 'Kubernetes', 'Terraform'],
      capacity: '42/40h',
      utilization: 105,
      projects: ['Cloud Infrastructure', 'ERP Migration', 'Security Audit'],
      status: 'überlastet'
    },
    {
      initials: 'TF',
      name: 'Tom Fischer',
      role: 'Full Stack Developer',
      skills: ['Vue.js', 'Python', 'PostgreSQL'],
      capacity: '35/40h',
      utilization: 88,
      projects: ['HR Portal'],
      status: 'verfügbar'
    },
    {
      initials: 'LH',
      name: 'Lisa Hoffmann',
      role: 'Marketing Manager',
      skills: ['Content', 'SEO', 'Analytics'],
      capacity: '30/40h',
      utilization: 75,
      projects: ['Marketing Automation'],
      status: 'verfügbar'
    }
  ],
  skillGaps: [
    { skill: 'React', required: 8, available: 5, gap: 3 },
    { skill: 'TypeScript', required: 6, available: 6, gap: 0 },
    { skill: 'Node.js', required: 5, available: 4, gap: 1 },
    { skill: 'AWS', required: 4, available: 2, gap: 2 },
    { skill: 'Kubernetes', required: 3, available: 2, gap: 1 },
    { skill: 'UI/UX Design', required: 4, available: 3, gap: 1 }
  ]
};

export const ResourcesView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
        <TabsTrigger value="calendar">Kalender & Verfügbarkeit</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Filter & Actions Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="designer">Designer</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="verfügbar">Verfügbar</SelectItem>
              <SelectItem value="überlastet">Überlastet</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Teamgröße"
            value={resourceData.kpis.teamSize}
            icon={<Users className="h-5 w-5 text-blue-600" />}
            iconColor="bg-blue-100"
          />
          <KPICard
            title="Ø Auslastung"
            value={`${resourceData.kpis.avgUtilization}%`}
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            iconColor="bg-green-100"
            progress={resourceData.kpis.avgUtilization}
          />
          <KPICard
            title="Konflikte"
            value={resourceData.kpis.conflicts}
            icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
            iconColor="bg-orange-100"
          />
          <KPICard
            title="Skill-Gaps"
            value={resourceData.kpis.skillGaps}
            icon={<Target className="h-5 w-5 text-purple-600" />}
            iconColor="bg-purple-100"
          />
        </div>

        {/* Ressourcen-Konflikte */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <CardTitle className="text-orange-900">Ressourcen-Konflikte erkannt</CardTitle>
                <p className="text-sm text-orange-700 mt-1">{resourceData.kpis.conflicts} Konflikte benötigen Ihre Aufmerksamkeit</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceData.conflicts.map((conflict) => (
              <Card key={conflict.id} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{conflict.person}</p>
                      <p className="text-sm text-muted-foreground">{conflict.issue}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">{conflict.week}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conflict.actions.map((action, idx) => (
                      <Button key={idx} variant="outline" size="sm">
                        {action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Team-Auslastung & Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Team-Auslastung & Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Mitarbeiter</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Rolle</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Skills</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Kapazität</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Auslastung</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Projekte</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceData.team.map((member) => (
                    <tr key={member.initials} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                            {member.initials}
                          </div>
                          <span className="font-medium text-sm">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{member.role}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                          {member.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">+{member.skills.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{member.capacity}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={Math.min(member.utilization, 100)} 
                            className={`h-2 w-16 ${member.utilization > 100 ? '[&>div]:bg-red-500' : ''}`}
                          />
                          <span className={`text-sm font-medium ${member.utilization > 100 ? 'text-red-500' : ''}`}>
                            {member.utilization}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-[150px] truncate">
                        {member.projects.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={member.status === 'überlastet' 
                            ? 'bg-red-100 text-red-700 hover:bg-red-100' 
                            : 'bg-green-100 text-green-700 hover:bg-green-100'
                          }
                        >
                          {member.status === 'verfügbar' ? 'Verfügbar' : 'Überlastet'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Skill-Matrix & Gaps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skill-Matrix & Gaps</CardTitle>
            <Button variant="link" className="gap-1 text-sm">
              Vollständige Ansicht
              <ExternalLink className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resourceData.skillGaps.map((skillData) => (
                <div key={skillData.skill} className="flex items-center gap-4">
                  <span className="font-medium text-sm w-28">{skillData.skill}</span>
                  <div className="flex-1 flex gap-1 h-6">
                    <div 
                      className="bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(skillData.available / skillData.required) * 100}%` }}
                    >
                      {skillData.available}
                    </div>
                    {skillData.gap > 0 && (
                      <div 
                        className="bg-red-500 rounded flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${(skillData.gap / skillData.required) * 100}%` }}
                      >
                        {skillData.gap}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground w-32 text-right">
                    Bedarf: {skillData.required} | Verf.: {skillData.available}
                  </div>
                  {skillData.gap > 0 ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                      Gap: {skillData.gap}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                      OK
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Verfügbar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Gap</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>OK</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-6">
        <ResourceCalendarView />
      </TabsContent>
    </Tabs>
  );
};