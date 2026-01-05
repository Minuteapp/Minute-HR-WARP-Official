import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Flag,
  CheckSquare,
  Circle
} from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ViewMode = 'selection' | 'gantt';
type TimeView = 'week' | 'month' | 'quarter' | 'year';

interface RoadmapCardData {
  id: string;
  title: string;
  description: string;
  status: 'aktiv' | 'geplant' | 'archiviert';
  location: string;
  team: string;
  department: string;
  projects: number;
  milestones: number;
  progress: number;
  period: string;
  responsible: string;
}

export const RoadmapTimelineTab = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeView, setTimeView] = useState<TimeView>('month');
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);
  const [elementFilter, setElementFilter] = useState('all');

  const companyId = useCompanyId();
  const { roadmaps: roadmapsData = [] } = useRoadmaps();

  // Projekte laden
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-timeline', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId);
      return data || [];
    },
    enabled: !!companyId
  });

  // Dynamische KPI-Daten
  const activeRoadmaps = roadmapsData.filter(r => r.status === 'active');
  const plannedRoadmaps = roadmapsData.filter(r => r.status === 'draft' || r.status === 'on_hold');
  const archivedRoadmaps = roadmapsData.filter(r => r.status === 'completed' || r.status === 'cancelled');

  const kpiData = [
    { label: 'Gesamt', value: roadmapsData.length, bgColor: 'bg-gray-100' },
    { label: 'Aktiv', value: activeRoadmaps.length, borderColor: 'border-l-violet-500' },
    { label: 'Geplant', value: plannedRoadmaps.length, borderColor: 'border-l-green-500' },
    { label: 'Archiviert', value: archivedRoadmaps.length, borderColor: 'border-l-gray-400' },
  ];

  // Roadmaps für Karten umwandeln
  const roadmapCards: RoadmapCardData[] = roadmapsData.map(r => ({
    id: r.id,
    title: r.title || 'Unbenannte Roadmap',
    description: r.description || 'Keine Beschreibung',
    status: r.status === 'active' ? 'aktiv' : r.status === 'draft' ? 'geplant' : 'archiviert',
    location: 'Alle Standorte',
    team: 'Team',
    department: 'Abteilung',
    projects: projects.filter(p => p.roadmap_id === r.id).length,
    milestones: 0,
    progress: r.progress || 0,
    period: r.start_date && r.end_date 
      ? `${new Date(r.start_date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })} - ${new Date(r.end_date).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`
      : 'Kein Zeitraum',
    responsible: r.created_by || 'Kein Verantwortlicher'
  }));

  // Filter anwenden
  const filteredRoadmaps = roadmapCards.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const months = ['Nov. 2025', 'Dez. 2025', 'Jan. 2026', 'Feb. 2026', 'März 2026', 'Apr. 2026'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktiv':
        return <Badge variant="outline" className="border-green-500 text-green-700 text-xs">aktiv</Badge>;
      case 'geplant':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 text-xs">geplant</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-400 text-gray-600 text-xs">archiviert</Badge>;
    }
  };

  if (viewMode === 'gantt' && selectedRoadmap) {
    const roadmapProjects = projects.filter(p => p.roadmap_id === selectedRoadmap.id);

    return (
      <div className="space-y-6">
        {/* Back Link */}
        <button 
          onClick={() => { setViewMode('selection'); setSelectedRoadmap(null); }}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Roadmap-Auswahl
        </button>

        {/* Roadmap Header */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold">{selectedRoadmap.title}</h2>
                  {getStatusBadge(selectedRoadmap.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{selectedRoadmap.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedRoadmap.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{selectedRoadmap.team}</span>
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{selectedRoadmap.department}</span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{selectedRoadmap.responsible}</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm">Heute</Button>
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as TimeView[]).map((view) => (
              <Button
                key={view}
                variant={timeView === view ? 'default' : 'ghost'}
                size="sm"
                className={timeView === view ? 'bg-green-600 text-white' : ''}
                onClick={() => setTimeView(view)}
              >
                {view === 'week' ? 'Woche' : view === 'month' ? 'Monat' : view === 'quarter' ? 'Quartal' : 'Jahr'}
              </Button>
            ))}
          </div>
        </div>

        {/* Filter Dropdown */}
        <Select value={elementFilter} onValueChange={setElementFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Ebenen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Ebenen</SelectItem>
            <SelectItem value="projects">Nur Projekte</SelectItem>
            <SelectItem value="milestones">Nur Meilensteine</SelectItem>
            <SelectItem value="tasks">Nur Aufgaben</SelectItem>
          </SelectContent>
        </Select>

        {/* Gantt Chart */}
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="flex border-b bg-gray-50">
              <div className="w-48 p-3 border-r font-medium text-sm">Element</div>
              <div className="flex-1 flex">
                {months.map((month, i) => (
                  <div key={i} className="flex-1 p-3 text-center text-sm font-medium border-r last:border-r-0">
                    {month}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Section */}
            <div className="border-b">
              <div className="flex items-center p-3 bg-gray-50 border-b">
                <ChevronDown className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">Projekte ({roadmapProjects.length})</span>
              </div>
              {roadmapProjects.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground italic">
                  Keine Projekte in dieser Roadmap.
                </div>
              ) : (
                roadmapProjects.map((project) => (
                  <div key={project.id} className="flex border-b last:border-b-0">
                    <div className="w-48 p-3 border-r text-sm flex items-center gap-2">
                      <Circle className="h-3 w-3 text-violet-500 fill-violet-500" />
                      {project.name}
                    </div>
                    <div className="flex-1 p-3 relative">
                      <div 
                        className="absolute h-6 bg-violet-500 rounded flex items-center px-2"
                        style={{ left: '10%', width: '40%', top: '50%', transform: 'translateY(-50%)' }}
                      >
                        <span className="text-white text-xs truncate">{project.name}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Heute marker info */}
            <div className="p-3 text-xs text-muted-foreground">
              Die rote Linie markiert das heutige Datum.
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-violet-500 rounded" />
            <span>Projekt aktiv</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-gray-400" />
            <span>Meilenstein offen</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-violet-500 fill-violet-500" />
            <span>Meilenstein erreicht</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500" />
            <span>Heute</span>
          </div>
        </div>
      </div>
    );
  }

  // Selection View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Roadmap auswählen</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Wählen Sie eine Roadmap aus, um die zugehörigen Projekte, Meilensteine und Aufgaben in der Zeitleiste anzuzeigen.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className={`border shadow-sm ${kpi.borderColor ? `border-l-4 ${kpi.borderColor}` : kpi.bgColor}`}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Section */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Filter</span>
            </div>
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              {showAdvancedFilters ? 'Filter ausblenden' : 'Mehr Filter anzeigen'}
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Roadmap suchen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Select>
                <SelectTrigger><SelectValue placeholder="Standort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                  <SelectItem value="berlin">Berlin</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Teams</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Abteilung" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roadmap Cards Grid */}
      {filteredRoadmaps.length === 0 ? (
        <Card className="border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Keine Roadmaps gefunden.</p>
            <p className="text-sm text-muted-foreground mt-1">Erstellen Sie eine neue Roadmap, um zu beginnen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredRoadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="border shadow-sm border-l-4 border-l-violet-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{roadmap.title}</h3>
                  {getStatusBadge(roadmap.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{roadmap.description}</p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{roadmap.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{roadmap.team}</span>
                  <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{roadmap.department}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                  <div><span className="text-muted-foreground">Projekte</span><p className="font-medium">{roadmap.projects}</p></div>
                  <div><span className="text-muted-foreground">Meilensteine</span><p className="font-medium">{roadmap.milestones}</p></div>
                  <div><span className="text-muted-foreground">Fortschritt</span><p className="font-medium">{roadmap.progress}%</p></div>
                  <div><span className="text-muted-foreground">Zeitraum</span><p className="font-medium">{roadmap.period}</p></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{roadmap.responsible}</span>
                  <button 
                    onClick={() => { setSelectedRoadmap(roadmap); setViewMode('gantt'); }}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    Zeitleiste anzeigen →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
