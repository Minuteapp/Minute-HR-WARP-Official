import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  User, 
  Grid3X3,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { NewRoadmapDialog } from '../NewRoadmapDialog';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const RoadmapManageTab = () => {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { roadmaps, isLoading, deleteRoadmap } = useRoadmaps();

  // Status-Mapping von DB zu Anzeige
  const getDisplayStatus = (status: string): 'aktiv' | 'geplant' | 'archiviert' | 'pausiert' | 'abgebrochen' => {
    switch (status) {
      case 'active': return 'aktiv';
      case 'draft': return 'geplant';
      case 'completed': return 'archiviert';
      case 'on_hold': return 'pausiert';
      case 'cancelled': return 'abgebrochen';
      default: return 'geplant';
    }
  };

  // Filter-Status-Mapping für DB-Werte
  const getDbStatus = (displayStatus: string): string | null => {
    switch (displayStatus) {
      case 'aktiv': return 'active';
      case 'geplant': return 'draft';
      case 'archiviert': return 'completed';
      case 'pausiert': return 'on_hold';
      case 'abgebrochen': return 'cancelled';
      default: return null;
    }
  };

  const filteredRoadmaps = roadmaps.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === getDbStatus(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'aktiv':
        return <Badge variant="outline" className="border-green-500 text-green-700 text-xs">aktiv</Badge>;
      case 'geplant':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 text-xs">geplant</Badge>;
      case 'archiviert':
        return <Badge variant="outline" className="border-gray-500 text-gray-700 text-xs">archiviert</Badge>;
      case 'pausiert':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 text-xs">pausiert</Badge>;
      case 'abgebrochen':
        return <Badge variant="outline" className="border-red-500 text-red-700 text-xs">abgebrochen</Badge>;
      default:
        return null;
    }
  };

  const formatPeriod = (startDate?: string | null, endDate?: string | null) => {
    if (!startDate && !endDate) return 'Kein Zeitraum definiert';
    
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
    return 'Kein Zeitraum definiert';
  };

  const formatCreatedAt = (date: string) => {
    try {
      return format(new Date(date), 'dd.MM.yyyy', { locale: de });
    } catch {
      return date;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diese Roadmap wirklich löschen?')) {
      await deleteRoadmap.mutateAsync(id);
    }
  };

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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Roadmaps verwalten</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Erstellen und organisieren Sie strategische Roadmaps für Ihre Projekte
          </p>
        </div>
        <Button 
          onClick={() => setShowNewDialog(true)}
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Neue Roadmap
        </Button>
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
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              {showAdvancedFilters ? 'Weniger Filter' : 'Mehr Filter'}
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Roadmap suchen (Name oder Beschreibung)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="geplant">Geplant</SelectItem>
                  <SelectItem value="archiviert">Archiviert</SelectItem>
                  <SelectItem value="pausiert">Pausiert</SelectItem>
                  <SelectItem value="abgebrochen">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Standorte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                  <SelectItem value="berlin">Berlin</SelectItem>
                  <SelectItem value="munich">München</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Teams</SelectItem>
                  <SelectItem value="exec">Executive Board</SelectItem>
                  <SelectItem value="it">IT Operations</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Abteilungen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="mgmt">Management</SelectItem>
                  <SelectItem value="dev">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Count Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          {filteredRoadmaps.length} von {roadmaps.length} Roadmaps
        </Badge>
      </div>

      {/* Roadmap List */}
      <div className="space-y-4">
        {filteredRoadmaps.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {roadmaps.length === 0 
                  ? 'Noch keine Roadmaps vorhanden. Erstellen Sie Ihre erste Roadmap!'
                  : 'Keine Roadmaps gefunden, die den Filterkriterien entsprechen.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRoadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="border shadow-sm border-l-4 border-l-violet-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{roadmap.title}</h3>
                      {getStatusBadge(roadmap.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {roadmap.description || 'Keine Beschreibung'}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Zeitraum: {formatPeriod(roadmap.start_date, roadmap.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Fortschritt: {roadmap.progress}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Priorität: {roadmap.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Grid3X3 className="h-4 w-4" />
                        <span>Meilensteine: {roadmap.milestones?.length || 0}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Erstellt am {formatCreatedAt(roadmap.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate(`/projects/roadmap/${roadmap.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate(`/projects/roadmap/${roadmap.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(roadmap.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


      {/* New Roadmap Dialog */}
      <NewRoadmapDialog 
        open={showNewDialog} 
        onOpenChange={setShowNewDialog} 
      />
    </div>
  );
};
