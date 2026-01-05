import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Clock, Calendar, TrendingDown, Briefcase, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import TimeEntryDetailsDialog from "./TimeEntryDetailsDialog";
import { TimeEntry } from "@/types/time-tracking.types";

const MobileHistoryView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  const entriesPerPage = 5;

  // Lade Zeiteinträge mit Error-Handling
  const { data: allEntries = [], error: entriesError, isLoading: entriesLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Lade Wocheneinträge für Statistiken
  const { data: weekEntries = [], error: weekError, isLoading: weekLoading } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: () => timeTrackingService.getWeekTimeEntries(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Berechne Statistiken
  const calculateWeeklyHours = () => {
    const totalMinutes = weekEntries.reduce((total, entry) => {
      if (!entry.end_time) return total;
      const start = new Date(entry.start_time).getTime();
      const end = new Date(entry.end_time).getTime();
      const breakMinutes = entry.break_minutes || 0;
      const workMinutes = (end - start) / (1000 * 60) - breakMinutes;
      return total + workMinutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const workDays = new Set(weekEntries.map(e => new Date(e.start_time).toDateString())).size;
  const activeProjects = new Set(allEntries.map(e => e.project).filter(Boolean)).size;

  // Overtime berechnen - basierend auf echten Daten
  const weeklyMinutes = weekEntries.reduce((total, entry) => {
    if (!entry.end_time) return total;
    const start = new Date(entry.start_time).getTime();
    const end = new Date(entry.end_time).getTime();
    const breakMinutes = entry.break_minutes || 0;
    return total + ((end - start) / (1000 * 60) - breakMinutes);
  }, 0);
  const targetMinutes = 40 * 60; // 40 Stunden Soll
  const overtimeMinutes = weeklyMinutes - targetMinutes;
  const overtimeHours = Math.floor(Math.abs(overtimeMinutes) / 60);
  const overtimeMins = Math.floor(Math.abs(overtimeMinutes) % 60);
  const overtime = `${overtimeMinutes >= 0 ? '+' : '-'}${overtimeHours}:${overtimeMins.toString().padStart(2, '0')}`;

  // Filter Einträge
  const filteredEntries = allEntries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.note?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === "all" || entry.project === projectFilter;
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      completed: { label: 'Genehmigt', className: 'bg-black text-white' },
      pending: { label: 'Ausstehend', className: 'bg-gray-300 text-gray-700' },
      active: { label: 'Aktiv', className: 'bg-green-500 text-white' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-200' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (entry: TimeEntry) => {
    if (!entry.end_time) return '0:00';
    const start = new Date(entry.start_time).getTime();
    const end = new Date(entry.end_time).getTime();
    const breakMinutes = entry.break_minutes || 0;
    const workMinutes = (end - start) / (1000 * 60) - breakMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = Math.floor(workMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getLocationText = (location?: string) => {
    const map: Record<string, string> = {
      office: 'Büro',
      home: 'Home Office',
      mobile: 'Unterwegs',
      client: 'Beim Kunden'
    };
    return map[location || ''] || location || 'Nicht angegeben';
  };

  // Loading State
  if (entriesLoading || weekLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fehleranzeige */}
      {(entriesError || weekError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Fehler beim Laden der Arbeitszeitdaten. Bitte prüfen Sie Ihre Internetverbindung.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Arbeitshistorie</h1>
        <p className="text-xs text-gray-500">Übersicht Ihrer erfassten Arbeitszeiten</p>
      </div>

      {/* Download Button */}
      <button className="w-full py-2.5 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors bg-white">
        <Download className="h-4 w-4 text-gray-700" />
      </button>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wochenstunden */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Wochenstunden</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {calculateWeeklyHours()}
          </div>
          <div className="text-xs text-blue-700">von 40:00 Std.</div>
        </div>

        {/* Arbeitstage */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">Arbeitstage</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {workDays}
          </div>
          <div className="text-xs text-green-700">Diese Woche</div>
        </div>

        {/* Über-/Unterzeit */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-900">Über-/Unterzeit</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 mb-1">
            {overtime}
          </div>
          <div className="text-xs text-orange-700">Aktuell</div>
        </div>

        {/* Projekte */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-900">Projekte</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {activeProjects}
          </div>
          <div className="text-xs text-purple-700">Aktive Projekte</div>
        </div>
      </div>

      {/* Zeiteinträge Section */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Zeiteinträge</h2>

        {/* Suchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 text-sm h-10"
          />
        </div>

        {/* Filter */}
        <div className="space-y-2">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="bg-gray-50 h-10 text-sm">
              <SelectValue placeholder="Alle Projekte" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Alle Projekte</SelectItem>
              {/* Dynamisch aus vorhandenen Einträgen */}
              {Array.from(new Set(allEntries.map(e => e.project).filter(Boolean))).map(project => (
                <SelectItem key={project} value={project!}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-gray-50 h-10 text-sm">
              <SelectValue placeholder="Alle Status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="completed">Genehmigt</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Einträge Liste */}
        <div className="space-y-3">
          {paginatedEntries.map((entry) => (
            <div key={entry.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(entry.start_time)}
                  </span>
                  {getStatusBadge(entry.status)}
                </div>
              </div>

              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{entry.project || 'Allgemein'}</span>
                  <span className="text-gray-400">•</span>
                  <span>{getLocationText(entry.location)}</span>
                </div>
                {entry.note && (
                  <div className="text-gray-600">{entry.note}</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {calculateDuration(entry)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Pause: {entry.break_minutes ? `${Math.floor(entry.break_minutes / 60)}:${(entry.break_minutes % 60).toString().padStart(2, '0')}` : '0:00'}
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setShowDetailsDialog(true);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ansehen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700 h-7 px-2"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="space-y-2 pt-2">
            <div className="text-center text-xs text-gray-500">
              Zeige {startIndex + 1} von {filteredEntries.length} Einträgen
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0 text-sm"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <TimeEntryDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        entry={selectedEntry}
      />
    </div>
  );
};

export default MobileHistoryView;
