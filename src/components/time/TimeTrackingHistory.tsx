import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Clock, Search, Filter, Calendar as CalendarIcon, MapPin, Edit, ChevronRight, BarChart3, Briefcase, Eye, Trash2, Upload, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { TimeEntry, HistoryFilters } from "@/types/time-tracking.types";
import TimeEntryDetailsDialog from "./dialogs/TimeEntryDetailsDialog";
import EditTimeEntryDialog from "./dialogs/EditTimeEntryDialog";
import { TimeImportDialog } from "./dialogs/TimeImportDialog";
import { TimeEntryFilters } from "./filters/TimeEntryFilters";
import { Calendar } from "@/components/ui/calendar";
import DailyOverviewWidget from "./widgets/DailyOverviewWidget";
import HistoryEmptyState from "./HistoryEmptyState";
import { useTimeExport } from "@/hooks/time-tracking/useTimeExport";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DailyEntry {
  date: string;
  entries: TimeEntry[];
  totalDuration: number;
  totalBreakTime: number;
  startTime?: string;
  endTime?: string;
  locations: string[];
  projects: string[];
}

const TimeTrackingHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<DailyEntry | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>({
    startDate: undefined,
    endDate: undefined,
    projects: [],
    locations: [],
    status: []
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const { exportToCSV } = useTimeExport();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Korrigierter Query-Aufruf ohne Argumente
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
    refetchInterval: 30000,
  });

  const getStatusBadge = (status: TimeEntry['status']) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktiv</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pausiert</Badge>;
      case 'completed':
        return <Badge className="bg-black text-white">Genehmigt</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Abgebrochen</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const formatDuration = (entry: TimeEntry) => {
    if (!entry.end_time && entry.status !== 'active') return 'Laufend';
    
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}h`;
  };

  const getLocationText = (location?: string) => {
    switch(location) {
      case 'office': return 'Büro';
      case 'home': return 'Home Office';
      case 'mobile': return 'Unterwegs';
      default: return location || 'Unbekannt';
    }
  };

  // Gruppiere Einträge nach Tagen
  const groupEntriesByDay = (entries: TimeEntry[]): DailyEntry[] => {
    const grouped = entries.reduce((groups: { [key: string]: TimeEntry[] }, entry) => {
      const date = new Date(entry.start_time).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {});

    return Object.entries(grouped).map(([date, dayEntries]) => {
      const sortedEntries = dayEntries.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      const totalDuration = sortedEntries.reduce((total, entry) => {
        if (!entry.end_time && entry.status !== 'completed') return total;
        const start = new Date(entry.start_time);
        const end = entry.end_time ? new Date(entry.end_time) : new Date();
        return total + Math.floor((end.getTime() - start.getTime()) / 1000);
      }, 0);

      const totalBreakTime = sortedEntries.reduce((total, entry) => {
        return total + ((entry.break_minutes || 0) * 60);
      }, 0);

      const startTime = sortedEntries[0]?.start_time;
      const endTime = sortedEntries[sortedEntries.length - 1]?.end_time;
      
      const locations = [...new Set(sortedEntries.map(e => getLocationText(e.location)))];
      const projects = [...new Set(sortedEntries.map(e => e.project || 'Allgemein'))];

      return {
        date,
        entries: sortedEntries,
        totalDuration: totalDuration - totalBreakTime, // Arbeitszeit ohne Pausen
        totalBreakTime,
        startTime,
        endTime,
        locations,
        projects
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const dailyEntries = groupEntriesByDay(timeEntries);

  const filteredDailyEntries = dailyEntries.filter(dayEntry => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      dayEntry.projects.some(project => project.toLowerCase().includes(searchLower)) ||
      dayEntry.locations.some(location => location.toLowerCase().includes(searchLower)) ||
      dayEntry.entries.some(entry => entry.note?.toLowerCase().includes(searchLower))
    );
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}h`;
  };

  const handleDayClick = (dayEntry: DailyEntry) => {
    setSelectedDay(dayEntry);
    setShowDayDetails(true);
  };

  const handleViewEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowEntryDetails(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (entryId: string) => {
    setEntryToDelete(entryId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      await timeTrackingService.deleteTimeEntry(entryToDelete);
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Eintrag gelöscht",
        description: "Der Zeiteintrag wurde erfolgreich gelöscht.",
      });
      setShowDeleteDialog(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Der Eintrag konnte nicht gelöscht werden.",
      });
    }
  };

  const handleExport = () => {
    exportToCSV(timeEntries, 'Mitarbeiter');
  };

  // Berechne verfügbare Projekte
  useEffect(() => {
    const projects = [...new Set(timeEntries.map(e => e.project).filter(Boolean))] as string[];
    setAvailableProjects(projects);
  }, [timeEntries]);

  // Berechne aktive Filter-Anzahl
  useEffect(() => {
    let count = 0;
    if (filters.startDate || filters.endDate) count++;
    if (filters.projects && filters.projects.length > 0) count++;
    if (filters.locations && filters.locations.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Filter-Funktion
  const applyFilters = (entries: TimeEntry[]) => {
    return entries.filter(entry => {
      // Datum-Filter
      if (filters.startDate) {
        const entryDate = new Date(entry.start_time);
        const filterDate = new Date(filters.startDate);
        filterDate.setHours(0, 0, 0, 0);
        entryDate.setHours(0, 0, 0, 0);
        if (entryDate < filterDate) return false;
      }
      if (filters.endDate) {
        const entryDate = new Date(entry.start_time);
        const filterDate = new Date(filters.endDate);
        filterDate.setHours(23, 59, 59, 999);
        entryDate.setHours(0, 0, 0, 0);
        if (entryDate > filterDate) return false;
      }
      
      // Status-Filter
      if (filters.status && filters.status.length > 0 && !filters.status.includes(entry.status)) return false;
      
      // Projekt-Filter
      if (filters.projects && filters.projects.length > 0 && !filters.projects.includes(entry.project || '')) return false;
      
      // Ort-Filter
      if (filters.locations && filters.locations.length > 0 && !filters.locations.includes(entry.location || '')) return false;
      
      // Such-Query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          (entry.project?.toLowerCase().includes(searchLower)) ||
          (entry.location?.toLowerCase().includes(searchLower)) ||
          (entry.note?.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  };

  // Berechne Wochen-Statistiken
  const { data: weekEntries = [] } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: () => timeTrackingService.getWeekTimeEntries(),
  });

  const weekStats = {
    totalHours: weekEntries.reduce((sum, entry) => {
      if (!entry.end_time) return sum;
      const duration = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
      const breakHours = (entry.break_minutes || 0) / 60;
      return sum + duration - breakHours;
    }, 0),
    workDays: new Set(weekEntries.map(e => new Date(e.start_time).toDateString())).size,
    projects: new Set(weekEntries.map(e => e.project)).size,
  };

  const targetWeekHours = 40;
  const overtime = weekStats.totalHours - targetWeekHours;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Lädt Verlauf...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Statistik-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Wochenstunden</div>
            <div className="text-2xl font-bold">{weekStats.totalHours.toFixed(1)}</div>
            <div className="text-xs text-gray-500">von {targetWeekHours}:00 Std</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Arbeitstage</div>
            <div className="text-2xl font-bold">{weekStats.workDays}</div>
            <div className="text-xs text-gray-500">Diese Woche</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Über-/Unterzeit</div>
            <div className={`text-2xl font-bold ${overtime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {overtime >= 0 ? '+' : ''}{overtime.toFixed(1)} h
            </div>
            <div className="text-xs text-gray-500">Aktuell</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Projekte</div>
            <div className="text-2xl font-bold">{weekStats.projects}</div>
            <div className="text-xs text-gray-500">Aktive Projekte</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kalender */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Kalender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single"
              selected={calendarDate}
              onSelect={setCalendarDate}
              className="rounded-md border"
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

        {/* Zeiteinträge Liste */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Zeiteinträge
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Projekte, Notizen oder Arbeitsort durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <TimeEntryFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableProjects={availableProjects}
                  onClose={() => setShowFilters(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
          <CardContent>
            {filteredDailyEntries.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  Keine Einträge gefunden
                </div>
              ) : (
                <HistoryEmptyState 
                  onStartTracking={() => {
                    window.location.href = '/time';
                  }}
                />
              )
            ) : (
              <div className="space-y-2">
                {applyFilters(timeEntries)
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .slice(0, 20)
                  .map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {new Date(entry.start_time).toLocaleDateString('de-DE', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                          {getStatusBadge(entry.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm mb-1">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{entry.project || 'Allgemein'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{getLocationText(entry.location)}</span>
                          </div>
                        </div>
                        
                        {entry.note && (
                          <div className="text-sm text-gray-600 mt-1">
                            Notiz: "{entry.note}"
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <div className="text-lg font-semibold">
                            {formatDuration(entry)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewEntry(entry)}
                          title="Ansehen"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEntry(entry)}
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(entry.id)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Day Details Dialog */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          {selectedDay && (
            <DailyOverviewWidget 
              date={new Date(selectedDay.date)}
              entries={selectedDay.entries}
              onEditEntry={handleEditEntry}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Entry Details Dialog */}
      <TimeEntryDetailsDialog 
        open={showEntryDetails}
        onOpenChange={setShowEntryDetails}
        entry={selectedEntry}
        onEdit={handleEditEntry}
      />

      {/* Edit Entry Dialog */}
      <EditTimeEntryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        entry={selectedEntry}
        onSave={async () => {
          await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
          setShowEditDialog(false);
        }}
      />

      {/* Import Dialog */}
      <TimeImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        userId={timeEntries[0]?.user_id || ''}
        onImportComplete={async () => {
          await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
        }}
      />


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zeiteintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Zeiteintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimeTrackingHistory;
