
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

interface InterviewEvent {
  id: string;
  date: string;
  time: string;
  location: string;
  participants: string;
  agenda: string;
  notes: string;
}

const OnboardingInterview = () => {
  const { toast } = useToast();
  // ZERO-DATA: Keine Mockup-Daten - leeres Array für neue Tenants
  const [interviews, setInterviews] = useState<InterviewEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentInterview, setCurrentInterview] = useState<InterviewEvent>({
    id: '',
    date: '',
    time: '',
    location: '',
    participants: '',
    agenda: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveInterview = () => {
    if (!currentInterview.date || !currentInterview.time) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus."
      });
      return;
    }

    if (isEditing) {
      setInterviews(interviews.map(interview => 
        interview.id === currentInterview.id ? currentInterview : interview
      ));
      toast({
        title: "Gespräch aktualisiert",
        description: "Das Einführungsgespräch wurde erfolgreich aktualisiert."
      });
    } else {
      const newInterview = {
        ...currentInterview,
        id: Math.random().toString(36).substr(2, 9)
      };
      setInterviews([...interviews, newInterview]);
      toast({
        title: "Gespräch erstellt",
        description: "Das Einführungsgespräch wurde erfolgreich erstellt."
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(interviews.filter(interview => interview.id !== id));
    toast({
      title: "Gespräch gelöscht",
      description: "Das Einführungsgespräch wurde erfolgreich gelöscht."
    });
  };

  const handleEditInterview = (interview: InterviewEvent) => {
    setCurrentInterview(interview);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleNewInterview = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setCurrentInterview({
      id: '',
      date: '',
      time: '',
      location: '',
      participants: '',
      agenda: '',
      notes: ''
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Einführungsgespräche</CardTitle>
              <CardDescription>
                Termine und Details für Onboarding-Gespräche mit neuen Mitarbeitern.
              </CardDescription>
            </div>
            <Button onClick={handleNewInterview}>
              Neues Gespräch
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Keine Einführungsgespräche geplant.</p>
              <Button variant="outline" className="mt-4" onClick={handleNewInterview}>
                Gespräch planen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="overflow-hidden">
                  <div className="border-b p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">
                        Einführungsgespräch am {formatDate(interview.date)}
                      </h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditInterview(interview)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteInterview(interview.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Datum:</span>
                        <span className="ml-2 font-medium">{formatDate(interview.date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Uhrzeit:</span>
                        <span className="ml-2 font-medium">{interview.time} Uhr</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Ort:</span>
                        <span className="ml-2 font-medium">{interview.location || 'Nicht angegeben'}</span>
                      </div>
                      <div className="flex items-start text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                        <span className="text-muted-foreground mt-1">Teilnehmer:</span>
                        <span className="ml-2 font-medium">{interview.participants || 'Nicht angegeben'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Agenda</h4>
                        <p className="text-sm whitespace-pre-line">{interview.agenda || 'Keine Agenda angegeben.'}</p>
                      </div>
                      {interview.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Notizen</h4>
                          <p className="text-sm">{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog für Erstellung/Bearbeitung */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Einführungsgespräch bearbeiten' : 'Neues Einführungsgespräch'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentInterview.date}
                  onChange={(e) => setCurrentInterview({...currentInterview, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Uhrzeit</Label>
                <Input
                  id="time"
                  type="time"
                  value={currentInterview.time}
                  onChange={(e) => setCurrentInterview({...currentInterview, time: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={currentInterview.location}
                onChange={(e) => setCurrentInterview({...currentInterview, location: e.target.value})}
                placeholder="z.B. Konferenzraum A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants">Teilnehmer</Label>
              <Input
                id="participants"
                value={currentInterview.participants}
                onChange={(e) => setCurrentInterview({...currentInterview, participants: e.target.value})}
                placeholder="Namen und Rollen der Teilnehmer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea
                id="agenda"
                rows={3}
                value={currentInterview.agenda}
                onChange={(e) => setCurrentInterview({...currentInterview, agenda: e.target.value})}
                placeholder="Tagesordnungspunkte für das Gespräch"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                rows={2}
                value={currentInterview.notes}
                onChange={(e) => setCurrentInterview({...currentInterview, notes: e.target.value})}
                placeholder="Zusätzliche Hinweise"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSaveInterview}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingInterview;
