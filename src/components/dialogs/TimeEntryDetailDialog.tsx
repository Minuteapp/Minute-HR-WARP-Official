import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Calendar, User, FileText, PlayCircle, StopCircle, Coffee, Timer } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { format, differenceInMinutes, parseISO } from "date-fns";
import { de } from "date-fns/locale";

interface TimeEntryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: TimeEntry | null;
}

const TimeEntryDetailDialog = ({ open, onOpenChange, timeEntry }: TimeEntryDetailDialogProps) => {
  if (!timeEntry) return null;

  const startTime = parseISO(timeEntry.start_time);
  const endTime = timeEntry.end_time ? parseISO(timeEntry.end_time) : null;
  const workingMinutes = endTime ? differenceInMinutes(endTime, startTime) : 0;
  const workingHours = Math.floor(workingMinutes / 60);
  const remainingMinutes = workingMinutes % 60;
  const breakMinutes = timeEntry.break_minutes || 0;
  const netWorkingMinutes = workingMinutes - breakMinutes;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'completed': return <StopCircle className="h-4 w-4" />;
      case 'pending': return <Coffee className="h-4 w-4" />;
      case 'cancelled': return <StopCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeiteintrag Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status und Grundinformationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(timeEntry.status)}
                Status & Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(timeEntry.status)}>
                  {timeEntry.status === 'active' && 'Aktiv'}
                  {timeEntry.status === 'completed' && 'Abgeschlossen'}
                  {timeEntry.status === 'pending' && 'Ausstehend'}
                  {timeEntry.status === 'cancelled' && 'Abgebrochen'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Datum</div>
                    <div className="text-sm text-muted-foreground">
                      {format(startTime, 'EEEE, dd.MM.yyyy', { locale: de })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Arbeitszeit</div>
                    <div className="text-sm text-muted-foreground">
                      {workingHours}:{String(remainingMinutes).padStart(2, '0')} Std
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zeitangaben */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Zeitangaben
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Arbeitsbeginn</span>
                </div>
                <span className="text-green-800 font-mono">
                  {format(startTime, 'HH:mm:ss')} Uhr
                </span>
              </div>

              {endTime && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <StopCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Arbeitsende</span>
                  </div>
                  <span className="text-blue-800 font-mono">
                    {format(endTime, 'HH:mm:ss')} Uhr
                  </span>
                </div>
              )}

              {breakMinutes > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Pausenzeit</span>
                  </div>
                  <span className="text-orange-800 font-mono">
                    {breakMinutes} Minuten
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Netto-Arbeitszeit</span>
                </div>
                <span className="text-purple-800 font-mono">
                  {Math.floor(netWorkingMinutes / 60)}:{String(netWorkingMinutes % 60).padStart(2, '0')} Std
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Projekt und Standort */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Projekt & Standort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projekt:</span>
                <Badge variant="outline">
                  {timeEntry.project === 'none' ? 'Allgemeine Arbeit' : timeEntry.project}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Standort:</span>
                <Badge variant="outline">
                  {timeEntry.location === 'office' ? 'Büro' : 
                   timeEntry.location === 'home' ? 'Homeoffice' : 
                   timeEntry.location === 'customer' ? 'Beim Kunden' : timeEntry.location}
                </Badge>
              </div>

              {timeEntry.office_location_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Büro-ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {timeEntry.office_location_id}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notizen und Metadaten */}
          {(timeEntry.note || timeEntry.department || timeEntry.category) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Zusätzliche Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeEntry.note && (
                  <div>
                    <span className="text-sm font-medium">Notiz:</span>
                    <p className="text-sm text-muted-foreground mt-1 p-2 bg-gray-50 rounded">
                      {timeEntry.note}
                    </p>
                  </div>
                )}
                
                {timeEntry.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Abteilung:</span>
                    <Badge variant="outline">{timeEntry.department}</Badge>
                  </div>
                )}
                
                {timeEntry.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Kategorie:</span>
                    <Badge variant="outline">{timeEntry.category}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Technische Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Technische Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Eintrag-ID:</span>
                <span className="text-sm text-muted-foreground font-mono">{timeEntry.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Erstellt:</span>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(timeEntry.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Aktualisiert:</span>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(timeEntry.updated_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                </span>
              </div>

              {timeEntry.correction_status && timeEntry.correction_status !== 'none' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Korrektur-Status:</span>
                  <Badge variant={timeEntry.correction_status === 'approved' ? 'default' : 'secondary'}>
                    {timeEntry.correction_status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryDetailDialog;