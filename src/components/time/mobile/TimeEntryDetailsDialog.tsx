import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Play, Square, Briefcase, MapPin, Coffee, Edit } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { parseBreaks } from "@/utils/time-entry-helpers";

interface TimeEntryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry | null;
}

const TimeEntryDetailsDialog = ({ open, onOpenChange, entry }: TimeEntryDetailsDialogProps) => {
  if (!entry) return null;

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

  const calculateDuration = () => {
    if (!entry.end_time) return '0:00';
    const start = new Date(entry.start_time).getTime();
    const end = new Date(entry.end_time).getTime();
    const breakMinutes = entry.break_minutes || 0;
    const workMinutes = (end - start) / (1000 * 60) - breakMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = Math.floor(workMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      completed: { label: 'Genehmigt', className: 'bg-white/30 text-white border-white/50' },
      pending: { label: 'Ausstehend', className: 'bg-white/30 text-white border-white/50' },
      active: { label: 'Aktiv', className: 'bg-white/30 text-white border-white/50' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-white/30 text-white' };
    return <Badge className={config.className} variant="outline">{config.label}</Badge>;
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

  // Timeline-Visualisierung
  const renderTimeline = () => {
    if (!entry.end_time) return null;

    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const breakMinutes = entry.break_minutes || 0;
    const workMinutes = totalMinutes - breakMinutes;

    // Berechne Prozentanteile für Visualisierung
    const workPercentage = (workMinutes / totalMinutes) * 100;
    const breakPercentage = (breakMinutes / totalMinutes) * 100;

    // Simuliere Pausen-Positionen (Mock: 2 Pausen)
    const breaks = [
      { start: 30, duration: 15 }, // 30% durch den Tag, 15% Dauer
      { start: 70, duration: 10 }  // 70% durch den Tag, 10% Dauer
    ];

    return (
      <div className="relative h-16 bg-green-500 rounded-full overflow-hidden shadow-lg">
        {/* Pausen als orange Segmente */}
        {breaks.map((breakItem, idx) => (
          <div
            key={idx}
            className="absolute h-full bg-orange-500 flex items-center justify-center"
            style={{
              left: `${breakItem.start}%`,
              width: `${breakItem.duration}%`
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Coffee className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        ))}

        {/* Start Marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-green-600 shadow-lg flex items-center justify-center -ml-5">
          <Play className="h-4 w-4 text-green-600" fill="currentColor" />
        </div>

        {/* End Marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-4 border-red-600 shadow-lg flex items-center justify-center -mr-5">
          <Square className="h-4 w-4 text-red-600" fill="currentColor" />
        </div>
      </div>
    );
  };

  const breaks = parseBreaks(entry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-h-[90vh] overflow-hidden flex flex-col bg-white max-w-[95vw] sm:max-w-[600px]">
        {/* Purple Header */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 relative flex-shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 text-white hover:text-purple-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute top-3 right-11 text-white hover:text-purple-100 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <div className="flex flex-col items-center text-white pt-1">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Zeiteintrag Details</h2>
            <div className="flex gap-2">
              <Badge className="bg-white/30 text-white border-white/50 text-xs" variant="outline">
                {formatDate(entry.start_time)}
              </Badge>
              {getStatusBadge(entry.status)}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Zeitstrahl */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Zeitstrahl</h3>
            </div>

            {renderTimeline()}

            {/* Zeit-Info Karten */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                <Play className="h-3.5 w-3.5 text-green-600 mx-auto mb-1" />
                <div className="text-xs text-gray-500 mb-0.5">Start</div>
                <div className="text-sm font-bold">{formatTime(entry.start_time)}</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                <Clock className="h-3.5 w-3.5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-gray-500 mb-0.5">Arbeitszeit</div>
                <div className="text-sm font-bold">{calculateDuration()}</div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                <Square className="h-3.5 w-3.5 text-red-600 mx-auto mb-1" />
                <div className="text-xs text-gray-500 mb-0.5">Ende</div>
                <div className="text-sm font-bold">{formatTime(entry.end_time)}</div>
              </div>
            </div>

            {/* Legende */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Arbeitszeit</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Pause</span>
              </div>
            </div>
          </div>

          {/* Zeiten Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Zeiten</h3>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-600 mb-0.5">Startzeit</div>
              <div className="text-sm font-bold text-gray-900">{formatTime(entry.start_time)} Uhr</div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-600 mb-0.5">Endzeit</div>
              <div className="text-sm font-bold text-gray-900">{formatTime(entry.end_time)} Uhr</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-2 space-y-1 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Arbeitszeit</span>
                <span className="font-bold text-gray-900">{calculateDuration()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pausenzeit</span>
                <span className="font-bold text-orange-600">
                  {entry.break_minutes ? `${Math.floor(entry.break_minutes / 60)}:${(entry.break_minutes % 60).toString().padStart(2, '0')}` : '0:00'}
                </span>
              </div>
            </div>
          </div>

          {/* Zuordnung */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Zuordnung</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Projekt</div>
                  <div className="text-sm font-medium text-gray-900">{entry.project || 'Allgemein'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Arbeitsort</div>
                  <div className="text-sm font-medium text-gray-900">{getLocationText(entry.location)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pausen */}
          {breaks.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Pausen ({breaks.length})</h3>
              </div>

              {breaks.map((breakItem, idx) => (
                <div key={breakItem.id} className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-600">Pause {idx + 1}</span>
                        <Badge variant="secondary" className="text-xs bg-white h-5 px-1.5">
                          {breakItem.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{breakItem.from} - {breakItem.to}</span>
                        <span className="font-bold text-gray-900">{breakItem.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notizen */}
          {entry.note && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Notizen</h3>
              <p className="text-sm text-gray-600">{entry.note}</p>
            </div>
          )}

          {/* Schließen Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm h-9"
          >
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryDetailsDialog;
