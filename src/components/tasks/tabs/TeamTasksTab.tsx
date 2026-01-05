import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, TrendingUp, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  totalTasks: number;
  openTasks: number;
  inProgress: number;
  completed: number;
  utilization: number;
  status?: 'Überlastet' | 'Verfügbar' | 'Normal';
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Lisa Schmidt',
    initials: 'LS',
    role: 'HR Manager',
    totalTasks: 8,
    openTasks: 1,
    inProgress: 2,
    completed: 5,
    utilization: 85,
    status: 'Normal'
  },
  {
    id: '2',
    name: 'Thomas Weber',
    initials: 'TW',
    role: 'Teamleiter',
    totalTasks: 12,
    openTasks: 2,
    inProgress: 4,
    completed: 6,
    utilization: 120,
    status: 'Überlastet'
  },
  {
    id: '3',
    name: 'Anna Becker',
    initials: 'AB',
    role: 'HR Specialist',
    totalTasks: 6,
    openTasks: 1,
    inProgress: 1,
    completed: 4,
    utilization: 60,
    status: 'Verfügbar'
  },
  {
    id: '4',
    name: 'Michael König',
    initials: 'MK',
    role: 'Payroll Manager',
    totalTasks: 10,
    openTasks: 1,
    inProgress: 2,
    completed: 7,
    utilization: 95,
    status: 'Normal'
  },
  {
    id: '5',
    name: 'Julia Hoffmann',
    initials: 'JH',
    role: 'Recruiting',
    totalTasks: 7,
    openTasks: 1,
    inProgress: 3,
    completed: 3,
    utilization: 75,
    status: 'Normal'
  }
];

export function TeamTasksTab() {
  const totalTeamTasks = teamMembers.reduce((sum, m) => sum + m.totalTasks, 0);
  const avgUtilization = Math.round(teamMembers.reduce((sum, m) => sum + m.utilization, 0) / teamMembers.length);
  const overloadedCount = teamMembers.filter(m => m.utilization > 100).length;
  const completedThisWeek = 25;

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 80) return 'text-orange-600';
    if (utilization < 70) return 'text-green-600';
    return 'text-gray-900';
  };

  const getUtilizationBarColor = (utilization: number) => {
    if (utilization > 100) return 'bg-red-500';
    if (utilization > 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* KI-Teamanalyse */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">KI-Teamanalyse</h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Engpass erkannt:</strong> Thomas Weber ist mit 120% ausgelastet und hat 1 überfällige Aufgabe. Empfehlung: 2 Aufgaben an Anna Becker delegieren, die aktuell nur 60% ausgelastet ist.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Aufgaben neu zuweisen
              </Button>
              <Button size="sm" variant="outline">
                Details ansehen
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Team-Metriken */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Team-Aufgaben</span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-semibold">{totalTeamTasks}</div>
          <div className="text-xs text-gray-500 mt-1">Über 5 Mitarbeiter</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Ø Auslastung</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-green-600">{avgUtilization}%</div>
          <div className="text-xs text-green-600 mt-1">Gesunder Bereich</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Überlastet</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-semibold text-red-600">{overloadedCount}</div>
          <div className="text-xs text-red-600 mt-1">Thomas Weber</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Abgeschlossen</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-semibold text-green-600">{completedThisWeek}</div>
          <div className="text-xs text-gray-500 mt-1">Diese Woche</div>
        </Card>
      </div>

      {/* Team-Übersicht Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team-Übersicht</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Aufgabe zuweisen
        </Button>
      </div>

      {/* Team-Mitglieder Liste */}
      <div className="space-y-3">
        {overloadedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">{overloadedCount} überfällige Aufgabe(n)</span>
          </div>
        )}

        {teamMembers.map((member) => (
          <Card key={member.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                {member.initials}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  {member.status === 'Überlastet' && (
                    <Badge variant="destructive" className="text-xs">Überlastet</Badge>
                  )}
                  {member.status === 'Verfügbar' && (
                    <Badge className="text-xs bg-green-100 text-green-700">Verfügbar</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>

              <div className="grid grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Gesamt</div>
                  <div className="text-lg font-semibold">{member.totalTasks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Offen</div>
                  <div className="text-lg font-semibold">{member.openTasks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">In Arbeit</div>
                  <div className="text-lg font-semibold text-blue-600">{member.inProgress}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Erledigt</div>
                  <div className="text-lg font-semibold text-green-600">{member.completed}</div>
                </div>
              </div>

              <div className="w-64">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Auslastung</span>
                  <span className={`font-semibold ${getUtilizationColor(member.utilization)}`}>
                    {member.utilization}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full ${getUtilizationBarColor(member.utilization)} transition-all`}
                    style={{ width: `${Math.min(member.utilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
