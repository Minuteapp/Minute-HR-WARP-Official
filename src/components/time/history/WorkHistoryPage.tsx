import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, AlertCircle, BarChart3, Search, Eye, Edit2, Trash2, Download, ChevronLeft, ChevronRight, Building2, MapPin, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { useToast } from "@/hooks/use-toast";
import TimeEntryDetailsDialog from "./TimeEntryDetailsDialog";
import TimeEntryEditDialog from "./TimeEntryEditDialog";

const WorkHistoryPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Echte Zeiteinträge aus der Datenbank laden
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
  });

  // Wocheneinträge für KPIs
  const { data: weekEntries = [] } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: () => timeTrackingService.getWeekTimeEntries(),
  });

  // Hilfsfunktion zum Formatieren der Dauer
  const formatDuration = (entry: any): string => {
    if (!entry.start_time) return "0:00";
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const breakMs = (entry.break_minutes || 0) * 60 * 1000;
    const workMs = diffMs - breakMs;
    const hours = Math.floor(workMs / (1000 * 60 * 60));
    const minutes = Math.floor((workMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Zeiteinträge in das erwartete Format transformieren
  const entries = useMemo(() => {
    return timeEntries.map(entry => {
      const statusMap: Record<string, string> = {
        completed: 'Genehmigt',
        pending: 'Ausstehend',
        active: 'Aktiv',
        paused: 'Pausiert',
        cancelled: 'Abgebrochen'
      };
      return {
        id: entry.id,
        date: new Date(entry.start_time).toLocaleDateString('de-DE'),
        rawDate: new Date(entry.start_time),
        status: statusMap[entry.status] || 'Unbekannt',
        project: entry.project === 'none' ? 'Kein Projekt' : (entry.project || 'Allgemein'),
        location: entry.location === 'office' ? 'Büro' : 
                  entry.location === 'home' ? 'Home Office' : 
                  entry.location === 'mobile' ? 'Unterwegs' : 
                  entry.location === 'client' ? 'Beim Kunden' : (entry.location || 'Unbekannt'),
        description: entry.note || '',
        totalTime: formatDuration(entry),
        startTime: new Date(entry.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        endTime: entry.end_time ? new Date(entry.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        breakTime: `${Math.floor((entry.break_minutes || 0) / 60)}:${((entry.break_minutes || 0) % 60).toString().padStart(2, '0')}`,
        workTime: formatDuration(entry),
        note: entry.note || '',
        breaks: [],
        originalEntry: entry
      };
    });
  }, [timeEntries]);

  // KPIs berechnen
  const kpis = useMemo(() => {
    // Wochenstunden berechnen
    let totalWeekMinutes = 0;
    weekEntries.forEach(entry => {
      if (entry.start_time) {
        const start = new Date(entry.start_time);
        const end = entry.end_time ? new Date(entry.end_time) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const breakMs = (entry.break_minutes || 0) * 60 * 1000;
        const workMs = diffMs - breakMs;
        totalWeekMinutes += workMs / (1000 * 60);
      }
    });
    
    const weekHours = Math.floor(totalWeekMinutes / 60);
    const weekMinutes = Math.floor(totalWeekMinutes % 60);
    
    // Arbeitstage zählen (unique dates)
    const uniqueDays = new Set(
      weekEntries.map(entry => 
        new Date(entry.start_time).toDateString()
      )
    );
    
    // Über-/Unterzeit (40h Woche als Standard)
    const targetMinutes = 40 * 60;
    const diffMinutes = totalWeekMinutes - targetMinutes;
    const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
    const diffMins = Math.floor(Math.abs(diffMinutes) % 60);
    const diffSign = diffMinutes >= 0 ? '+' : '-';
    
    // Aktive Projekte
    const uniqueProjects = new Set(
      timeEntries
        .filter(e => e.project && e.project !== 'none')
        .map(e => e.project)
    );
    
    return {
      weeklyHours: `${weekHours}:${weekMinutes.toString().padStart(2, '0')}`,
      workDays: uniqueDays.size,
      overtime: `${diffSign}${diffHours}:${diffMins.toString().padStart(2, '0')}`,
      overtimeNegative: diffMinutes < 0,
      activeProjects: uniqueProjects.size
    };
  }, [weekEntries, timeEntries]);

  // Filter anwenden (inkl. Datumsfilter)
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Datumsfilter - wenn ein Datum ausgewählt ist, nur Einträge dieses Tages anzeigen
      if (selectedDate) {
        const entryDate = entry.rawDate;
        const isSameDay = 
          entryDate.getDate() === selectedDate.getDate() &&
          entryDate.getMonth() === selectedDate.getMonth() &&
          entryDate.getFullYear() === selectedDate.getFullYear();
        if (!isSameDay) {
          return false;
        }
      }
      
      // Suchfilter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!entry.project.toLowerCase().includes(query) &&
            !entry.location.toLowerCase().includes(query) &&
            !entry.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Projektfilter
      if (projectFilter !== 'all' && entry.project !== projectFilter) {
        return false;
      }
      
      // Statusfilter
      if (statusFilter !== 'all') {
        const statusMap: Record<string, string> = {
          approved: 'Genehmigt',
          pending: 'Ausstehend',
          active: 'Aktiv'
        };
        if (entry.status !== statusMap[statusFilter]) {
          return false;
        }
      }
      
      return true;
    });
  }, [entries, searchQuery, projectFilter, statusFilter, selectedDate]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Unique Projekte für Filter-Dropdown
  const uniqueProjects = useMemo(() => {
    const projects = new Set(entries.map(e => e.project));
    return Array.from(projects);
  }, [entries]);

  const handleViewDetails = (entry: any) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };

  const handleDelete = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
      toast({
        title: "Gelöscht",
        description: "Der Zeiteintrag wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Zeiteintrag konnte nicht gelöscht werden.",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Genehmigt":
        return "bg-green-500 text-white hover:bg-green-500";
      case "Ausstehend":
        return "bg-yellow-500 text-white hover:bg-yellow-500";
      case "Aktiv":
        return "bg-blue-500 text-white hover:bg-blue-500";
      case "Pausiert":
        return "bg-orange-500 text-white hover:bg-orange-500";
      case "Abgelehnt":
      case "Abgebrochen":
        return "bg-red-500 text-white hover:bg-red-500";
      default:
        return "bg-gray-500 text-white hover:bg-gray-500";
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Lade Arbeitshistorie...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Überschrift und Export-Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Arbeitshistorie</h1>
          <p className="text-sm text-muted-foreground">Übersicht Ihrer erfassten Arbeitszeiten</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* KPI-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Wochenstunden</span>
            </div>
            <div className="text-2xl font-bold">{kpis.weeklyHours}</div>
            <div className="text-xs text-muted-foreground">von 40:00 Std.</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Arbeitstage</span>
            </div>
            <div className="text-2xl font-bold">{kpis.workDays}</div>
            <div className="text-xs text-muted-foreground">Diese Woche</div>
          </CardContent>
        </Card>

        <Card className={`bg-card border border-border border-l-4 ${kpis.overtimeNegative ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`h-4 w-4 ${kpis.overtimeNegative ? 'text-red-600' : 'text-green-600'}`} />
              <span className="text-sm font-medium text-muted-foreground">Über-/Unterzeit</span>
            </div>
            <div className={`text-2xl font-bold ${kpis.overtimeNegative ? 'text-red-600' : 'text-green-600'}`}>
              {kpis.overtime}
            </div>
            <div className="text-xs text-muted-foreground">Aktuell</div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Projekte</span>
            </div>
            <div className="text-2xl font-bold">{kpis.activeProjects}</div>
            <div className="text-xs text-muted-foreground">Aktive Projekte</div>
          </CardContent>
        </Card>
      </div>

      {/* Hauptbereich mit Kalender und Zeiteinträgen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kalender (linke Seite) */}
        <Card className="lg:col-span-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Kalender</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={de}
              className="rounded-md"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Vollzeit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Teilzeit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Abwesend</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zeiteinträge (rechte Seite) */}
        <Card className="lg:col-span-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Zeiteinträge</h3>
            
            {/* Filter und Suche */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Alle Projekte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Projekte</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empty State */}
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Keine Zeiteinträge vorhanden</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Starten Sie die Zeiterfassung, um Ihre Arbeitshistorie zu sehen.
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Keine Einträge gefunden</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Passen Sie Ihre Suchkriterien an.
                </p>
              </div>
            ) : (
              <>
                {/* Zeiteinträge Liste */}
                <div className="space-y-3">
                  {paginatedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{entry.date}</span>
                            <Badge className={getStatusBadgeColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>{entry.project}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{entry.location}</span>
                            </div>
                            {entry.description && (
                              <div className="text-muted-foreground">{entry.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold mb-1">{entry.totalTime}</div>
                          <div className="text-xs text-muted-foreground mb-3">
                            {entry.startTime} - {entry.endTime}
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            Pause: {entry.breakTime}
                          </div>
                          {/* Aktionsbuttons */}
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={() => handleViewDetails(entry)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Eye className="h-3 w-3" />
                              Ansehen
                            </button>
                            <button
                              onClick={() => handleEdit(entry)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <Edit2 className="h-3 w-3" />
                              Bearbeiten
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="flex items-center gap-1 text-sm text-destructive hover:underline"
                            >
                              <Trash2 className="h-3 w-3" />
                              Löschen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button 
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"} 
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="text-center text-sm text-muted-foreground mt-4">
                  Zeige {paginatedEntries.length} von {filteredEntries.length} Einträgen
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialoge */}
      {selectedEntry && (
        <>
          <TimeEntryDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            entry={selectedEntry}
            onEdit={() => {
              setShowDetailsDialog(false);
              setShowEditDialog(true);
            }}
          />
          <TimeEntryEditDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            entry={selectedEntry}
          />
        </>
      )}
    </div>
  );
};

export default WorkHistoryPage;
