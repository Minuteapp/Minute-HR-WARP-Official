import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Play, Square, Coffee, Plus, Trash2, Building2, MapPin, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface TimeEntryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
}

const TimeEntryEditDialog = ({ open, onOpenChange, entry }: TimeEntryEditDialogProps) => {
  const [startTime, setStartTime] = useState(entry.startTime);
  const [endTime, setEndTime] = useState(entry.endTime);
  const [project, setProject] = useState(entry.project);
  const [location, setLocation] = useState(entry.location);
  const [note, setNote] = useState(entry.note || "");
  const [breaks, setBreaks] = useState(entry.breaks || []);

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      {
        id: breaks.length + 1,
        type: "Mittagspause",
        from: "12:00",
        to: "12:30",
        duration: "0:30"
      }
    ]);
  };

  const handleRemoveBreak = (breakId: number) => {
    setBreaks(breaks.filter((b: any) => b.id !== breakId));
  };

  const handleSave = () => {
    console.log("Saving entry:", {
      startTime,
      endTime,
      project,
      location,
      note,
      breaks
    });
    onOpenChange(false);
  };

  // Zeitstrahl-Daten berechnen
  const calculateTimelineBlocks = () => {
    const blocks = [];
    
    blocks.push({
      type: "work",
      left: 0,
      width: 40,
    });

    if (breaks.length > 0) {
      blocks.push({
        type: "pause",
        left: 40,
        width: 5,
      });

      blocks.push({
        type: "work",
        left: 45,
        width: 25,
      });
    }

    if (breaks.length > 1) {
      blocks.push({
        type: "pause",
        left: 70,
        width: 2.5,
      });

      blocks.push({
        type: "work",
        left: 72.5,
        width: 12.5,
      });
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
              <DialogTitle className="text-xl font-semibold">Zeiteintrag bearbeiten</DialogTitle>
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
        </div>

        <div className="p-6 space-y-6">
          {/* Zeitstrahl */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Zeitstrahl</h3>
                </div>
                <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">
                  Vorschau
                </Badge>
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
                    <div className="text-2xl font-bold">{startTime}</div>
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
                    <div className="text-2xl font-bold">{endTime}</div>
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
                    <label className="text-sm text-gray-600 mb-2 block">Startzeit</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{startTime}</span>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="border-0 p-0 h-auto ml-auto w-auto"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Endzeit</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{endTime}</span>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="border-0 p-0 h-auto ml-auto w-auto"
                      />
                    </div>
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Pausen ({breaks.length})</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddBreak}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Hinzufügen
                  </Button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {breaks.map((breakItem: any) => (
                    <div
                      key={breakItem.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <Coffee className="h-4 w-4 text-white" />
                          </div>
                          <div className="font-medium text-sm">Pause {breakItem.id}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBreak(breakItem.id)}
                          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Von</label>
                          <div className="flex items-center gap-1 border border-gray-200 rounded p-2 bg-white">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <Input
                              type="time"
                              defaultValue={breakItem.from}
                              className="border-0 p-0 h-auto text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Bis</label>
                          <div className="flex items-center gap-1 border border-gray-200 rounded p-2 bg-white">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <Input
                              type="time"
                              defaultValue={breakItem.to}
                              className="border-0 p-0 h-auto text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Art</label>
                        <Select defaultValue={breakItem.type}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mittagspause">Mittagspause</SelectItem>
                            <SelectItem value="Kurzpause">Kurzpause</SelectItem>
                            <SelectItem value="Sonstige">Sonstige</SelectItem>
                          </SelectContent>
                        </Select>
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Projekt
                  </label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website Redesign">Website Redesign</SelectItem>
                      <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                      <SelectItem value="Marketing Campaign Q4">Marketing Campaign Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Arbeitsort
                  </label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Büro">Büro</SelectItem>
                      <SelectItem value="Home Office">Home Office</SelectItem>
                      <SelectItem value="Unterwegs">Unterwegs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notizen */}
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Notizen</h3>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Fügen Sie hier Notizen hinzu..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Footer Buttons */}
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C3AED] text-white">
              Speichern
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryEditDialog;
