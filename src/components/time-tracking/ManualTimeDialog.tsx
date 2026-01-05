
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { timeTrackingService } from "@/services/timeTrackingService";
import LocationSelector from "./LocationSelector";
import ProjectSelector from "./ProjectSelector";
import ManualTimeInputs from "./ManualTimeInputs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MapWithToken from "./MapWithToken";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, MapPin, FileText, Save, X } from "lucide-react";

interface ManualTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ManualTimeDialog = ({ open, onOpenChange, onSuccess }: ManualTimeDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState("office");
  const [officeLocationId, setOfficeLocationId] = useState<string>();
  const [selectedOfficeName, setSelectedOfficeName] = useState<string>();
  const [project, setProject] = useState("none");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for active time entry
  const { data: activeEntry } = useQuery({
    queryKey: ['activeTimeEntry'],
    queryFn: timeTrackingService.getActiveTimeEntry,
    refetchInterval: 30000
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Set default times
      setStartTime(oneHourAgo.toISOString().slice(0, 16));
      setEndTime(now.toISOString().slice(0, 16));
      setLocation('office');
      setOfficeLocationId(undefined);
      setProject('none');
      setNote('');
      setIsSubmitting(false);
    }
  }, [open]);

  const validateForm = () => {
    if (!startTime || !endTime) {
      toast({
        variant: "destructive",
        title: "Ungültige Eingabe",
        description: "Bitte Start- und Endzeit auswählen.",
      });
      return false;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      toast({
        variant: "destructive",
        title: "Ungültige Zeitspanne",
        description: "Die Endzeit muss nach der Startzeit liegen.",
      });
      return false;
    }

    // Check if time span is reasonable (not more than 24 hours)
    const diffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
      toast({
        variant: "destructive",
        title: "Zeitspanne zu lang",
        description: "Die Zeitspanne darf nicht länger als 24 Stunden sein.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Nicht angemeldet",
        description: "Bitte melden Sie sich an, um die Zeiterfassung zu nutzen.",
      });
      navigate('/auth/login');
      return;
    }

    if (activeEntry) {
      toast({
        variant: "destructive",
        title: "Aktive Zeiterfassung vorhanden",
        description: "Es läuft bereits eine Zeiterfassung. Bitte beenden Sie diese zuerst.",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Manuelle Zeiterfassung wird erstellt...', {
        startTime,
        endTime,
        location,
        project,
        note
      });

      await timeTrackingService.createManualTimeEntry({
        start_time: startTime,
        end_time: endTime,
        location,
        office_location_id: officeLocationId,
        project,
        note,
        user_id: user.id
      });
      
      toast({
        title: "✅ Zeit erfolgreich erfasst",
        description: `Manuelle Zeiterfassung von ${new Date(startTime).toLocaleTimeString()} bis ${new Date(endTime).toLocaleTimeString()} wurde gespeichert.`,
      });
      
      // Queries invalidieren
      await queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
      
      onSuccess?.();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('❌ Fehler bei manueller Zeiterfassung:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message || "Die Zeiterfassung konnte nicht gespeichert werden.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (newLocation: string, locationId?: string) => {
    setLocation(newLocation);
    setOfficeLocationId(locationId);
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    
    if (diffMs <= 0) return '';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white border-[#33C3F0] border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#33C3F0]" />
            Zeit manuell erfassen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Duration Preview */}
          {calculateDuration() && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Geplante Dauer: {calculateDuration()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Inputs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[#33C3F0]" />
              <Label className="text-base font-medium">Arbeitszeit</Label>
            </div>
            <ManualTimeInputs
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
          </div>
          
          {/* Project Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-[#33C3F0]" />
              <Label className="text-base font-medium">Projekt</Label>
            </div>
            <ProjectSelector
              project={project}
              onProjectChange={setProject}
            />
          </div>
          
          {/* Location Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-[#33C3F0]" />
              <Label className="text-base font-medium">Arbeitsort</Label>
            </div>
            <LocationSelector
              location={location}
              office_location_id={officeLocationId}
              onLocationChange={handleLocationChange}
              selectedOfficeName={selectedOfficeName}
              onOfficeNameChange={setSelectedOfficeName}
            />
            
            {/* Map Preview */}
            <div className="h-[200px] w-full rounded-md overflow-hidden border">
              <MapWithToken
                address={selectedOfficeName}
                initialLocation={null}
                onLocationUpdate={(coords) => {
                  console.log("📍 Standort aktualisiert:", coords);
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-base font-medium">Notizen</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optionale Notiz zur Zeiterfassung (z.B. Tätigkeitsbeschreibung, Besonderheiten)"
              className="border-[#33C3F0] min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {note.length}/500 Zeichen
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="border-[#33C3F0] hover:bg-[#33C3F0]/5"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button 
              type="submit"
              className="bg-[#33C3F0] hover:bg-[#27A7D1]"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Speichert...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTimeDialog;
