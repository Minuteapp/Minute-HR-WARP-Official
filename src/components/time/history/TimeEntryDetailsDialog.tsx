import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Coffee, Edit2, Building2, MapPin, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimeEntryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
  onEdit: () => void;
}

const TimeEntryDetailsDialog = ({ open, onOpenChange, entry, onEdit }: TimeEntryDetailsDialogProps) => {
  // Zeitstrahl-Daten berechnen
  const calculateTimelineBlocks = () => {
    const startHour = 8;
    const endHour = 18;
    const totalHours = endHour - startHour;

    const blocks = [];

    // Arbeitsblock 1 (08:00 - 12:00)
    const work1Start = 0;
    const work1End = 4;
    blocks.push({
      type: "work",
      left: (work1Start / totalHours) * 100,
      width: ((work1End - work1Start) / totalHours) * 100,
    });

    // Pause 1 (12:00 - 12:30)
    if (entry.breaks && entry.breaks.length > 0) {
      const pause1Start = 4;
      const pause1End = 4.5;
      blocks.push({
        type: "pause",
        left: (pause1Start / totalHours) * 100,
        width: ((pause1End - pause1Start) / totalHours) * 100,
      });

      // Arbeitsblock 2 (12:30 - 15:00)
      const work2Start = 4.5;
      const work2End = 7;
      blocks.push({
        type: "work",
        left: (work2Start / totalHours) * 100,
        width: ((work2End - work2Start) / totalHours) * 100,
      });

      // Pause 2 (15:00 - 15:15) falls vorhanden
      if (entry.breaks.length > 1) {
        const pause2Start = 7;
        const pause2End = 7.25;
        blocks.push({
          type: "pause",
          left: (pause2Start / totalHours) * 100,
          width: ((pause2End - pause2Start) / totalHours) * 100,
        });

        // Arbeitsblock 3 (15:15 - 16:30)
        const work3Start = 7.25;
        const work3End = 8.5;
        blocks.push({
          type: "work",
          left: (work3Start / totalHours) * 100,
          width: ((work3End - work3Start) / totalHours) * 100,
        });
      }
    }

    return blocks;
  };

  const timelineBlocks = calculateTimelineBlocks();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Lila Gradient Header */}
        <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white p-6 rounded-t-lg relative">
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20 w-8 h-8 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Zeiteintrag Details</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 rounded-full px-3">
                  {entry.date}
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 rounded-full px-3">
                  {entry.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className="absolute bottom-4 right-4 text-white hover:bg-white/20"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Zeitstrahl */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Zeitstrahl</h3>
              </div>

              {/* Timeline */}
              <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden mb-4">
                {/* Start Icon */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="bg-green-500 rounded-full p-1">
                    <Play className="h-3 w-3 text-white" />
                  </div>
                </div>
                
                {/* End Icon */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="bg-red-500 rounded-full p-1">
                    <Square className="h-3 w-3 text-white" />
                  </div>
                </div>

                {/* Zeitmarkierungen */}
                <div className="absolute inset-x-0 top-0 flex justify-between px-8 pt-1 text-xs text-gray-500">
                  <span>08:00</span>
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                  <span>16:00</span>
                </div>

                {/* Timeline-Blöcke */}
                <div className="absolute inset-0 top-6 px-8 pb-2">
                  {timelineBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className={`absolute h-8 rounded ${
                        block.type === "work"
                          ? "bg-green-500"
                          : "bg-orange-500"
                      }`}
                      style={{
                        left: `${block.left}%`,
                        width: `${block.width}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Start, Arbeitszeit, Ende */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Play className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Start</span>
                    </div>
                    <div className="text-2xl font-bold">{entry.startTime}</div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Arbeitszeit</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{entry.workTime}</div>
                  </CardContent>
                </Card>
                <Card className="border border-gray-200">
                  <CardContent className="text-center p-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Square className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-gray-600">Ende</span>
                    </div>
                    <div className="text-2xl font-bold">{entry.endTime}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Legende */}
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Arbeitszeit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Pause</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zeiten und Pausen */}
          <div className="grid grid-cols-2 gap-6">
            {/* Zeiten */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Zeiten</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Startzeit</div>
                    <div className="text-xl font-semibold">{entry.startTime} Uhr</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Endzeit</div>
                    <div className="text-xl font-semibold">{entry.endTime} Uhr</div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Arbeitszeit</span>
                      <span className="text-lg font-bold">{entry.workTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-orange-600">
                      <span className="text-sm">Pausenzeit</span>
                      <span className="text-lg font-bold">{entry.breakTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pausen */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Pausen ({entry.breaks?.length || 0})</h3>
                </div>
                <div className="space-y-3">
                  {entry.breaks?.map((breakItem: any) => (
                    <div
                      key={breakItem.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <Coffee className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Pause {breakItem.id}</div>
                            <Badge variant="outline" className="text-xs bg-orange-100 border-orange-300 text-orange-700">
                              {breakItem.type}
                            </Badge>
                          </div>
                        </div>
                        <span className="font-bold text-orange-600">{breakItem.duration}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {breakItem.from} - {breakItem.to}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zuordnung */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Zuordnung</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Projekt</div>
                    <div className="font-medium">{entry.project}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Arbeitsort</div>
                    <div className="font-medium">{entry.location}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notizen */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Notizen</h3>
              <p className="text-gray-700">{entry.note || "Keine Notizen vorhanden"}</p>
            </CardContent>
          </Card>

          {/* Schließen Button - links positioniert */}
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryDetailsDialog;
