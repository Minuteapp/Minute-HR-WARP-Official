import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimeEntry } from '@/types/time-tracking.types';
import { 
  Clock, 
  Play, 
  Square, 
  Coffee, 
  Briefcase, 
  MapPin, 
  Edit,
  FileText
} from 'lucide-react';
import {
  formatTime,
  formatDate,
  calculateWorkTime,
  formatBreakTime,
  getStatusText,
  getLocationText,
  parseBreaks
} from '@/utils/time-entry-helpers';
import TimelineVisualization from '../widgets/TimelineVisualization';

interface TimeEntryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry | null;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entryId: string) => void;
}

const TimeEntryDetailsDialog = ({
  open,
  onOpenChange,
  entry,
  onEdit,
  onDelete
}: TimeEntryDetailsDialogProps) => {
  if (!entry) return null;

  const breaks = parseBreaks(entry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        {/* Lila Header */}
        <DialogHeader className="bg-purple-600 text-white p-6 rounded-t-lg space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-white">
              Zeiteintrag Details
            </DialogTitle>
            <Badge className="bg-white text-purple-600 hover:bg-white">
              {getStatusText(entry.status)}
            </Badge>
          </div>
          <div className="text-sm text-purple-100">
            {formatDate(entry.start_time)}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Drei Karten: Start, Arbeitszeit, Ende */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-2">
                  <Play className="h-4 w-4 text-green-600" />
                  Start
                </div>
                <div className="text-2xl font-bold">{formatTime(entry.start_time)}</div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-500 border-2">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Arbeitszeit
                </div>
                <div className="text-2xl font-bold text-blue-600">{calculateWorkTime(entry)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1 flex items-center justify-center gap-2">
                  <Square className="h-4 w-4 text-red-600" />
                  Ende
                </div>
                <div className="text-2xl font-bold">{formatTime(entry.end_time)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline-Visualisierung */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeitstrahl
            </h3>
            <TimelineVisualization entry={entry} compact={true} />
          </div>

          {/* Zeiten */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeiten
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Startzeit:</span>
                <span className="font-medium">{formatTime(entry.start_time)} Uhr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Endzeit:</span>
                <span className="font-medium">{formatTime(entry.end_time)} Uhr</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Arbeitszeit:</span>
                <span className="font-bold text-blue-600">{calculateWorkTime(entry)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pausenzeit:</span>
                <span className="font-bold text-orange-600">{formatBreakTime(entry.break_minutes)}</span>
              </div>
            </div>
          </div>

          {/* Pausen */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Pausen ({breaks.length})
            </h3>
            {breaks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Keine Pausen erfasst
              </div>
            ) : (
              <div className="space-y-3">
                {breaks.map((breakItem, index) => (
                  <div key={breakItem.id} className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{breakItem.type}</div>
                          <div className="text-sm text-gray-600">
                            {breakItem.from} - {breakItem.to}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold">{breakItem.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zuordnung */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Zuordnung</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Projekt</div>
                  <div className="font-medium">{entry.project || 'Kein Projekt'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Arbeitsort</div>
                  <div className="font-medium">{getLocationText(entry.location)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notizen
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg min-h-[60px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {entry.note || 'Keine Notizen vorhanden'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-6 bg-gray-50">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Schließen
          </Button>
          {onEdit && (
            <Button 
              onClick={() => {
                onEdit(entry);
                onOpenChange(false);
              }}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryDetailsDialog;
