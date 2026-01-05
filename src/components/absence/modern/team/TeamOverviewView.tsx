import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TeamOverviewToolbar } from './TeamOverviewToolbar';
import { TeamListView } from './TeamListView';
import { TeamGridView } from './TeamGridView';
import { TeamCalendarView } from './TeamCalendarView';
import { TeamMember, TeamFilters, GroupByOption, SortByOption, ViewMode } from '@/types/team.types';
import { Calendar, BarChart3, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teamAbsenceService } from '@/services/teamAbsenceService';
import { absenceExportService } from '@/services/absenceExportService';
import { toast } from '@/hooks/use-toast';
export const TeamOverviewView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TeamFilters>({
    departments: [],
    statuses: [],
    locations: []
  });
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [sortBy, setSortBy] = useState<SortByOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Team-Daten aus DB laden
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-overview', filters],
    queryFn: () => teamAbsenceService.getTeamOverview(filters)
  });

  // Statistiken aus DB laden
  const { data: stats } = useQuery({
    queryKey: ['team-statistics'],
    queryFn: () => teamAbsenceService.getTeamStatistics()
  });

  // Statistik-Karten mit echten Daten
  const quickStats = [
    {
      title: 'Aktuelle Abwesenheiten',
      value: stats?.currentAbsences?.toString() || '0',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Durchschnittlicher Resturlaub',
      value: stats?.avgRemainingVacation?.toString() || '0',
      suffix: ' Tage',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Abwesenheitsquote',
      value: stats?.absenceRate || '0',
      suffix: '%',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Offene Genehmigungen',
      value: stats?.pendingRequests?.toString() || '0',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    }
  ];

  // Filtern, Sortieren und Gruppieren
  const processedMembers = useMemo(() => {
    let filtered = [...teamMembers];

    // Suche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.employeeNumber?.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query)
      );
    }

    // Sortieren
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'vacation':
          return (b.vacationDays || 0) - (a.vacationDays || 0);
        case 'sick':
          return (b.sickDays || 0) - (a.sickDays || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [teamMembers, searchQuery, sortBy]);

  const handleExport = () => {
    if (processedMembers.length === 0) {
      toast({
        title: 'Keine Daten',
        description: 'Es sind keine Team-Mitglieder zum Exportieren vorhanden.',
        variant: 'destructive'
      });
      return;
    }
    absenceExportService.exportTeamOverview(processedMembers, 'team_uebersicht');
    toast({
      title: 'Export erfolgreich',
      description: 'Die Team-Übersicht wurde exportiert.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    {stat.suffix && <span className="text-lg text-muted-foreground">{stat.suffix}</span>}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <TeamOverviewToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={filters}
        onFilterChange={setFilters}
        groupBy={groupBy}
        onGroupByChange={(value) => setGroupBy(value as GroupByOption)}
        sortBy={sortBy}
        onSortByChange={(value) => setSortBy(value as SortByOption)}
        viewMode={viewMode}
        onViewModeChange={(value) => setViewMode(value as ViewMode)}
        onExport={handleExport}
      />

      {/* Content basierend auf viewMode */}
      {viewMode === 'list' && (
        <TeamListView members={processedMembers} groupBy={groupBy} />
      )}
      {viewMode === 'grid' && (
        <TeamGridView members={processedMembers} groupBy={groupBy} />
      )}
      {viewMode === 'calendar' && (
        <TeamCalendarView members={processedMembers} />
      )}
    </div>
  );
};
