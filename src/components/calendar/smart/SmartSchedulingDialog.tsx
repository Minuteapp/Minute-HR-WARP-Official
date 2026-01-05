
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateSmartSuggestion } from '@/hooks/useSmartCalendar';
import { Calendar, Clock, Users, Lightbulb } from 'lucide-react';

interface SmartSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SmartSchedulingDialog: React.FC<SmartSchedulingDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [eventTitle, setEventTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState('');
  const [preferredTimes, setPreferredTimes] = useState('');
  const [description, setDescription] = useState('');

  const generateSuggestion = useGenerateSmartSuggestion();

  const handleGenerateSuggestion = async () => {
    if (!eventTitle.trim()) {
      return;
    }

    const participantList = participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const timesList = preferredTimes
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      await generateSuggestion.mutateAsync({
        eventTitle,
        duration,
        participants: participantList.length > 0 ? participantList : undefined,
        preferredTimes: timesList.length > 0 ? timesList : undefined
      });

      // Reset form after successful generation
      setEventTitle('');
      setDuration(60);
      setParticipants('');
      setPreferredTimes('');
      setDescription('');

      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Generieren des Smart-Vorschlags:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart-Terminvorschlag generieren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="eventTitle">Termintitel</Label>
            <Input
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="z.B. Projekt-Meeting"
            />
          </div>

          <div>
            <Label htmlFor="duration">Dauer (Minuten)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              placeholder="60"
              min="15"
              max="480"
            />
          </div>

          <div>
            <Label htmlFor="participants">Teilnehmer (kommagetrennt)</Label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="max.mustermann@beispiel.de, anna.mueller@beispiel.de"
            />
          </div>

          <div>
            <Label htmlFor="preferredTimes">Bevorzugte Zeiten (kommagetrennt)</Label>
            <Input
              id="preferredTimes"
              value={preferredTimes}
              onChange={(e) => setPreferredTimes(e.target.value)}
              placeholder="09:00, 14:00, 16:00"
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Informationen zum Termin..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleGenerateSuggestion}
              disabled={generateSuggestion.isPending || !eventTitle.trim()}
            >
              <Clock className="h-4 w-4 mr-2" />
              {generateSuggestion.isPending ? 'Generiert...' : 'Vorschlag generieren'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartSchedulingDialog;
