import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeEntry } from '@/types/time-tracking.types';
import { Clock, MapPin, Briefcase, Coffee, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { timeTrackingService } from '@/services/timeTrackingService';

interface EditTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry | null;
  onSave?: () => void;
}

interface BreakPeriod {
  id: string;
  from: string;
  to: string;
  type: 'lunch' | 'short';
}

const EditTimeEntryDialog = ({ open, onOpenChange, entry, onSave }: EditTimeEntryDialogProps) => {
  const { toast } = useToast();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [project, setProject] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [breaks, setBreaks] = useState<BreakPeriod[]>([]);

  useEffect(() => {
    if (entry) {
      setStartTime(new Date(entry.start_time).toTimeString().slice(0, 5));
      setEndTime(entry.end_time ? new Date(entry.end_time).toTimeString().slice(0, 5) : '');
      setProject(entry.project || '');
      setLocation(entry.location || '');
      setNote(entry.note || '');
      
      // Initialisiere Pausen basierend auf break_minutes
      if (entry.break_minutes && entry.break_minutes > 0) {
        setBreaks([{
          id: '1',
          from: '',
          to: '',
          type: 'lunch'
        }]);
      }
    }
  }, [entry]);

  if (!entry) return null;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return '0:00';
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const totalMinutes = end - start;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateBreakTime = () => {
    // Vereinfachte Berechnung - in echter Anwendung aus break periods berechnen
    return breaks.length * 30;
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Aktiv</Badge>;
      case 'completed':
        return <Badge className="bg-black text-white">Genehmigt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Ausstehend</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  const getLocationText = () => {
    switch (location) {
      case 'office': return 'Büro';
      case 'home': return 'Home Office';
      case 'mobile': return 'Unterwegs';
      default: return location || 'Unbekannt';
    }
  };

  const addBreak = () => {
    setBreaks([...breaks, {
      id: Date.now().toString(),
      from: '',
      to: '',
      type: 'short'
    }]);
  };

  const removeBreak = (id: string) => {
    setBreaks(breaks.filter(b => b.id !== id));
  };

  const updateBreak = (id: string, field: keyof BreakPeriod, value: string) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSave = async () => {
    try {
      // Erstelle aktualisierte Zeiten basierend auf dem ursprünglichen Datum
      const baseDate = new Date(entry.start_time);
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const newStartTime = new Date(baseDate);
      newStartTime.setHours(startH, startM, 0, 0);
      
      const newEndTime = new Date(baseDate);
      newEndTime.setHours(endH, endM, 0, 0);

      const updatedEntry = {
        ...entry,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
        project,
        location,
        note,
        break_minutes: calculateBreakTime()
      };

      await timeTrackingService.updateTimeEntry(entry.id, updatedEntry);
      
      toast({
        title: "Zeiteintrag aktualisiert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      });
      
      if (onSave) onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Änderungen konnten nicht gespeichert werden.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        {/* Lila Header */}
        <DialogHeader className="bg-purple-600 text-white -m-6 mb-4 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-white">Zeiteintrag bearbeiten</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-purple-100">{formatDate(entry.start_time)}</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zeitstrahl-Vorschau (read-only) */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeitstrahl-Vorschau
            </h3>
            <div className="relative h-16 bg-white rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center">
                <div className="flex-1 h-2 bg-green-500 rounded-l-full"></div>
                {breaks.length > 0 && (
                  <div className="w-8 h-2 bg-orange-400"></div>
                )}
                <div className="flex-1 h-2 bg-green-500 rounded-r-full"></div>
              </div>
              <div className="absolute inset-0 flex justify-between items-center px-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-700 rounded-full mb-1"></div>
                  <div className="text-xs font-semibold">Start</div>
                  <div className="text-xs">{startTime || '--:--'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold">Arbeitszeit</div>
                  <div className="text-xs font-bold">{calculateDuration()}</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-red-700 rounded-full mb-1"></div>
                  <div className="text-xs font-semibold">Ende</div>
                  <div className="text-xs">{endTime || '--:--'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Zeiten-Sektion */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeiten
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Startzeit</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Endzeit</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Arbeitszeit:</span>
                <span className="font-bold">{calculateDuration()} h</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Pausenzeit:</span>
                <span className="font-bold">{calculateBreakTime()} min</span>
              </div>
            </div>
          </div>

          {/* Pausen-Sektion */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Pausen
            </h3>
            <div className="space-y-3">
              {breaks.map((breakPeriod, index) => (
                <div key={breakPeriod.id} className="flex items-end gap-3 p-3 bg-gray-50 rounded">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Pause {index + 1}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        placeholder="Von"
                        value={breakPeriod.from}
                        onChange={(e) => updateBreak(breakPeriod.id, 'from', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="time"
                        placeholder="Bis"
                        value={breakPeriod.to}
                        onChange={(e) => updateBreak(breakPeriod.id, 'to', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Select
                    value={breakPeriod.type}
                    onValueChange={(value) => updateBreak(breakPeriod.id, 'type', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunch">Mittagspause</SelectItem>
                      <SelectItem value="short">Kurzpause</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBreak(breakPeriod.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addBreak}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Pause hinzufügen
              </Button>
            </div>
          </div>

          {/* Zuordnung */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Zuordnung</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Projekt</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Projekt wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Projekt A">Projekt A</SelectItem>
                      <SelectItem value="Projekt B">Projekt B</SelectItem>
                      <SelectItem value="Projekt C">Projekt C</SelectItem>
                      <SelectItem value="Allgemein">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Arbeitsort</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Arbeitsort wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Büro</SelectItem>
                      <SelectItem value="home">Home Office</SelectItem>
                      <SelectItem value="mobile">Unterwegs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Notizen</h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Fügen Sie hier Notizen hinzu..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTimeEntryDialog;
