import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Users, TrendingUp, CheckCircle2, AlertTriangle, Search, Filter, MapPin, Building2, UsersRound } from 'lucide-react';
import { TeamMemberCard } from './TeamMemberCard';
import { AssignTaskDialog } from './AssignTaskDialog';
import { TeamMemberDetailDialog } from './TeamMemberDetailDialog';
import { ReassignTasksDialog } from './ReassignTasksDialog';
import { WorkloadAdjustDialog } from './WorkloadAdjustDialog';
import { useTeamTasksData } from '@/hooks/tasks/useTeamTasksData';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Verfügbar' | 'Normal' | 'Überlastet';
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  workload: number;
  overdueTasks?: number;
  avatarColor: string;
}

export const TeamTasksView = () => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showWorkloadDialog, setShowWorkloadDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const { teamMembers: dbTeamMembers, statistics, filterOptions, isLoading } = useTeamTasksData({
    search: searchTerm || undefined,
    department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
    team: selectedTeam !== 'all' ? selectedTeam : undefined,
    location: selectedLocation !== 'all' ? selectedLocation : undefined,
  });

  // Konvertiere DB-Daten zu UI-Format - keine Mock-Daten
  const teamMembers: TeamMember[] = dbTeamMembers.map((m, index) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    status: m.workloadPercent > 100 ? 'Überlastet' as const : 
           m.workloadPercent < 70 ? 'Verfügbar' as const : 'Normal' as const,
    totalTasks: m.activeTasks + m.completedTasks,
    openTasks: m.activeTasks - m.urgentTasks,
    inProgressTasks: m.urgentTasks,
    completedTasks: m.completedTasks,
    workload: m.workloadPercent,
    overdueTasks: 0,
    avatarColor: ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'][index % 5]
  }));

  const overloadedMember = teamMembers.find(m => m.status === 'Überlastet');
  const lowestWorkloadMember = teamMembers.length > 0 ? [...teamMembers].sort((a, b) => a.workload - b.workload)[0] : null;

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDetailDialog(true);
  };

  const handleReassignFromDetail = () => {
    setShowDetailDialog(false);
    setShowReassignDialog(true);
  };

  const handleAdjustWorkloadFromDetail = () => {
    setShowDetailDialog(false);
    setShowWorkloadDialog(true);
  };

  const handleReassignFromAnalysis = () => {
    if (overloadedMember) {
      setSelectedMember(overloadedMember);
      setShowReassignDialog(true);
    }
  };

  const handleViewDetails = () => {
    if (overloadedMember) {
      setSelectedMember(overloadedMember);
      setShowDetailDialog(true);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedTeam('all');
    setSelectedLocation('all');
  };

  // Statistiken
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.totalTasks, 0);
  const avgWorkload = teamMembers.length > 0 ? Math.round(teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length) : 0;
  const overloadedCount = teamMembers.filter(m => m.workload > 100).length;
  const completedThisWeek = statistics.completedThisWeek || teamMembers.reduce((sum, m) => sum + m.completedTasks, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KI-Teamanalyse */}
      {overloadedMember && lowestWorkloadMember && (
        <Card className="p-4 bg-white border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-2">KI-Teamanalyse</h3>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="font-semibold text-red-600">Engpass erkannt:</span>{' '}
                {overloadedMember.name} ist mit{' '}
                <span className="font-semibold">{overloadedMember.workload}% ausgelastet</span>
                {overloadedMember.overdueTasks && overloadedMember.overdueTasks > 0 && (
                  <> und hat <span className="font-semibold">{overloadedMember.overdueTasks} überfällige Aufgabe</span></>
                )}.{' '}
                <span className="font-semibold text-foreground">Empfehlung:</span>{' '}
                2 Aufgaben an {lowestWorkloadMember.name} delegieren, die aktuell nur {lowestWorkloadMember.workload}% ausgelastet ist.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={handleReassignFromAnalysis}>
                  Aufgaben neu zuweisen
                </Button>
                <Button size="sm" variant="outline" onClick={handleViewDetails}>
                  Details ansehen
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Team-Aufgaben</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mb-1">{totalTasks}</div>
          <div className="text-xs text-muted-foreground">Über {teamMembers.length} Mitarbeiter</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">⌀ Auslastung</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{avgWorkload}%</div>
          <div className="text-xs text-green-500 font-medium">
            {avgWorkload <= 90 ? 'Gesunder Bereich' : 'Erhöhte Auslastung'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">⚠ Überlastet</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold mb-1 text-red-600">{overloadedCount}</div>
          <div className="text-xs text-red-500 font-medium">
            {overloadedMember ? overloadedMember.name : 'Keine'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Abgeschlossen</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-1">{completedThisWeek}</div>
          <div className="text-xs text-green-500 font-medium">Diese Woche</div>
        </Card>
      </div>

      {/* Filter-Bereich */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Suche */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Standort */}
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Standort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              {filterOptions.locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Abteilung */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Abteilung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              {filterOptions.departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Team */}
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <UsersRound className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Teams</SelectItem>
              {filterOptions.teams.map((team) => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filter zurücksetzen */}
        {(searchTerm || selectedDepartment !== 'all' || selectedTeam !== 'all' || selectedLocation !== 'all') && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Filter zurücksetzen
            </Button>
          </div>
        )}
      </Card>

      {/* Team-Übersicht */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team-Übersicht ({teamMembers.length} Mitarbeiter)</h2>
          <Button onClick={() => setShowAssignDialog(true)}>
            Aufgabe zuweisen
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Keine Mitarbeiter gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedDepartment !== 'all' || selectedTeam !== 'all' || selectedLocation !== 'all'
                ? 'Keine Mitarbeiter entsprechen Ihren Filterkriterien.'
                : 'Es sind noch keine Mitarbeiter in diesem Unternehmen angelegt.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onClick={() => handleMemberClick(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialoge */}
      <AssignTaskDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        teamMembers={teamMembers}
      />

      <TeamMemberDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        member={selectedMember}
        onReassignTasks={handleReassignFromDetail}
        onAdjustWorkload={handleAdjustWorkloadFromDetail}
      />

      <ReassignTasksDialog
        open={showReassignDialog}
        onOpenChange={setShowReassignDialog}
        sourceMember={selectedMember}
        teamMembers={teamMembers}
      />

      <WorkloadAdjustDialog
        open={showWorkloadDialog}
        onOpenChange={setShowWorkloadDialog}
        member={selectedMember}
      />
    </div>
  );
};
