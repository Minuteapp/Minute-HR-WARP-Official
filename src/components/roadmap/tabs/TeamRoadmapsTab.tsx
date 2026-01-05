import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Users,
  Calendar,
  Eye,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { useTeamRoadmaps, TeamRoadmap } from '@/hooks/useTeamRoadmaps';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const TeamRoadmapsTab = () => {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const { data, isLoading } = useTeamRoadmaps();

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Aktiv</Badge>;
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Geplant</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Abgeschlossen</Badge>;
      case 'on_hold':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pausiert</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPeriod = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return 'Kein Zeitraum';
    
    const formatDate = (date: string) => {
      try {
        return format(new Date(date), 'MMM yyyy', { locale: de });
      } catch {
        return date;
      }
    };
    
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    if (startDate) return `Ab ${formatDate(startDate)}`;
    if (endDate) return `Bis ${formatDate(endDate)}`;
    return 'Kein Zeitraum';
  };

  // Filter-Logik
  const filteredTeamsWithRoadmaps = (data?.teamsWithRoadmaps || [])
    .map(team => ({
      ...team,
      roadmaps: team.roadmaps.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    }))
    .filter(team => {
      const matchesTeam = teamFilter === 'all' || team.id === teamFilter;
      return matchesTeam && team.roadmaps.length > 0;
    });

  const totalFilteredRoadmaps = filteredTeamsWithRoadmaps.reduce((sum, t) => sum + t.roadmaps.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Team-Roadmaps</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Roadmaps gruppiert nach Teams anzeigen und verwalten
        </p>
      </div>

      {/* Filter Section */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Filter & Suche</span>
            </div>
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              {showAdvancedFilters ? 'Weniger Filter' : 'Mehr Filter'}
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Roadmap oder Team suchen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Teams</SelectItem>
                  {data?.teamsWithRoadmaps
                    .filter(t => t.id !== 'unassigned')
                    .map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="draft">Geplant</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="on_hold">Pausiert</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-muted">
          {totalFilteredRoadmaps} Roadmaps in {filteredTeamsWithRoadmaps.length} Teams
        </Badge>
      </div>

      {/* Teams with Roadmaps */}
      {filteredTeamsWithRoadmaps.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Team-Roadmaps vorhanden</h3>
            <p className="text-sm text-muted-foreground">
              Es wurden noch keine Roadmaps mit Teams verknüpft.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTeamsWithRoadmaps.map(team => (
            <Collapsible 
              key={team.id} 
              open={expandedTeams.has(team.id) || expandedTeams.size === 0}
              onOpenChange={() => toggleTeam(team.id)}
            >
              <Card className="border shadow-sm">
                <CollapsibleTrigger asChild>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {team.roadmaps.length} Roadmaps, {team.activeCount} aktiv
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${
                      expandedTeams.has(team.id) || expandedTeams.size === 0 ? 'rotate-180' : ''
                    }`} />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className={`p-4 pt-0 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                    {team.roadmaps.map(roadmap => (
                      <Card 
                        key={roadmap.id} 
                        className="border hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/projects/roadmap/${roadmap.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{roadmap.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {roadmap.description || 'Keine Beschreibung'}
                              </p>
                            </div>
                            {getStatusBadge(roadmap.status)}
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatPeriod(roadmap.start_date, roadmap.end_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${roadmap.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs">{roadmap.progress || 0}%</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {roadmap.visibility === 'private' ? 'Privat' :
                               roadmap.visibility === 'team' ? 'Team' :
                               roadmap.visibility === 'department' ? 'Abteilung' : 'Unternehmen'}
                            </Badge>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};
