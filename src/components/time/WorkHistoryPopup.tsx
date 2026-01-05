import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, FileText, Calendar, User, Building, Play, Pause, Square, History } from 'lucide-react';
import { TimeEntry } from '@/types/time-tracking.types';
import { useQuery } from '@tanstack/react-query';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkHistoryPopupProps {
  triggerButton?: React.ReactNode;
}

export const WorkHistoryPopup = ({ triggerButton }: WorkHistoryPopupProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
    enabled: open && !!user,
    refetchInterval: 30000
  });

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}h`;
  };

  const calculateWorkTime = (entry: TimeEntry): number => {
    if (!entry.end_time) return 0;
    const start = new Date(entry.start_time).getTime();
    const end = new Date(entry.end_time).getTime();
    const totalTime = (end - start) / 1000;
    const breakTime = (entry.break_minutes || 0) * 60;
    return Math.max(0, totalTime - breakTime);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <Square className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
        return 'Pausiert';
      case 'completed':
        return 'Abgeschlossen';
      default:
        return 'Unbekannt';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Arbeitshistorie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Vollständige Arbeitshistorie
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 min-h-0">
          {/* Linke Seite - Liste der Zeiteinträge */}
          <div className="w-1/2 border-r">
            <ScrollArea className="h-[70vh] p-6">
              {isLoading ? (
                <div className="text-center py-8">Lade Arbeitshistorie...</div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Keine Zeiteinträge vorhanden</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeEntries.map((entry) => (
                    <Card 
                      key={entry.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedEntry?.id === entry.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(entry.status)}
                            <Badge className={getStatusColor(entry.status)}>
                              {getStatusLabel(entry.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(entry.start_time), 'dd.MM.yyyy', { locale: de })}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(new Date(entry.start_time), 'HH:mm', { locale: de })}
                              {entry.end_time && (
                                <> - {format(new Date(entry.end_time), 'HH:mm', { locale: de })}</>
                              )}
                            </span>
                          </div>
                          
                          {entry.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{entry.location}</span>
                            </div>
                          )}
                          
                          {entry.project && entry.project !== 'none' && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-3 w-3" />
                              <span>{entry.project}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium">
                              Arbeitszeit: {formatDuration(calculateWorkTime(entry))}
                            </span>
                            {entry.break_minutes && entry.break_minutes > 0 && (
                              <span className="text-xs text-gray-500">
                                Pause: {entry.break_minutes}min
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Rechte Seite - Detailansicht */}
          <div className="w-1/2">
            <ScrollArea className="h-[70vh] p-6">
              {selectedEntry ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(selectedEntry.status)}
                        Zeiteintrag Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(selectedEntry.status)}>
                              {getStatusLabel(selectedEntry.status)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">ID</label>
                          <p className="text-sm font-mono mt-1">{selectedEntry.id}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Datum & Zeit
                        </label>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Beginn:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(selectedEntry.start_time), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                            </span>
                          </div>
                          {selectedEntry.end_time && (
                            <div className="flex justify-between">
                              <span className="text-sm">Ende:</span>
                              <span className="text-sm font-medium">
                                {format(new Date(selectedEntry.end_time), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Arbeitszeit</label>
                          <p className="text-lg font-bold text-primary mt-1">
                            {formatDuration(calculateWorkTime(selectedEntry))}
                          </p>
                        </div>
                        {selectedEntry.break_minutes && selectedEntry.break_minutes > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Pausenzeit</label>
                            <p className="text-lg font-bold text-orange-600 mt-1">
                              {selectedEntry.break_minutes} Min
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Standort
                        </label>
                        <p className="mt-1">{selectedEntry.location || 'Nicht angegeben'}</p>
                      </div>
                      
                      {selectedEntry.project && selectedEntry.project !== 'none' && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Projekt
                          </label>
                          <p className="mt-1">{selectedEntry.project}</p>
                        </div>
                      )}
                      
                      {selectedEntry.note && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notiz
                          </label>
                          <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{selectedEntry.note}</p>
                        </div>
                      )}
                      
                      {selectedEntry.paused_work_seconds !== undefined && selectedEntry.paused_work_seconds > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Gespeicherte Arbeitszeit (bei Pause)</label>
                          <p className="mt-1 text-sm text-blue-600">
                            {formatDuration(selectedEntry.paused_work_seconds)}
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Erstellt: {format(new Date(selectedEntry.start_time), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</div>
                        {selectedEntry.updated_at && (
                          <div>Aktualisiert: {format(new Date(selectedEntry.updated_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</div>
                        )}
                        <div>Benutzer-ID: {selectedEntry.user_id}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Keine Auswahl</h3>
                  <p>Wählen Sie einen Zeiteintrag aus der Liste aus, um Details anzuzeigen.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};