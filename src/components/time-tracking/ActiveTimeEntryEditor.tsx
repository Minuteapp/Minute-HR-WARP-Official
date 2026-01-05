import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, Coffee } from 'lucide-react';
import { TimeEntry } from '@/types/time-tracking.types';
import { timeTrackingService } from '@/services/timeTrackingService';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import ProjectSelector from './ProjectSelector';
import LocationSelector from './LocationSelector';
import TaskSelector from './TaskSelector';
import CostCenterSelector from './CostCenterSelector';
import PlanBreakDialog from './PlanBreakDialog';

interface ActiveTimeEntryEditorProps {
  currentEntry: TimeEntry;
  isTracking: boolean;
}

const ActiveTimeEntryEditor = ({ currentEntry, isTracking }: ActiveTimeEntryEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPlanBreakOpen, setIsPlanBreakOpen] = useState(false);
  const [formData, setFormData] = useState({
    project: currentEntry.project || '',
    task: currentEntry.note || '',
    department: currentEntry.department || '',
    location: currentEntry.location || '',
    office_location_id: currentEntry.office_location_id || '',
    note: currentEntry.note || ''
  });
  const [selectedOfficeName, setSelectedOfficeName] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      await timeTrackingService.updateActiveTimeEntry(currentEntry.id, {
        project: formData.project || 'none',
        task: formData.task || undefined,
        department: formData.department || undefined,
        location: formData.location,
        office_location_id: formData.office_location_id || undefined,
        note: formData.note
      });

      // Alle relevanten Queries invalidieren
      await queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
      await queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
      await queryClient.invalidateQueries({ queryKey: ['projectHours'] });
      await queryClient.invalidateQueries({ queryKey: ['costCenterReport'] });
      await queryClient.invalidateQueries({ queryKey: ['taskReport'] });

      toast({
        title: "✅ Zeiterfassung aktualisiert",
        description: "Alle Änderungen wurden erfolgreich gespeichert.",
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Die Zeiterfassung konnte nicht aktualisiert werden.",
      });
    }
  };

  const handleLocationChange = (location: string, office_location_id?: string) => {
    setFormData({ ...formData, location, office_location_id: office_location_id || '' });
  };

  const handleProjectChange = (project: string) => {
    // Bei Projektwechsel auch die Aufgabe zurücksetzen
    setFormData({ ...formData, project, task: '' });
  };

  if (!isTracking) {
    return null;
  }

  return (
    <>
      <Card className="p-5 border-[#3B44F6] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#3B44F6]">Aktuelle Zeiterfassung</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlanBreakOpen(true)}
              className="border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Pause planen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-[#3B44F6] text-[#3B44F6] hover:bg-[#3B44F6]/5"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600 min-w-[100px]">Projekt:</span>
            <span className="text-gray-900">{currentEntry.project || 'Kein Projekt'}</span>
          </div>
          {currentEntry.note && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 min-w-[100px]">Aufgabe:</span>
              <span className="text-gray-900">{currentEntry.note}</span>
            </div>
          )}
          {currentEntry.department && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600 min-w-[100px]">Kostenstelle:</span>
              <span className="text-gray-900">{currentEntry.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600 min-w-[100px]">Ort:</span>
            <span className="text-gray-900">{currentEntry.location || 'Kein Ort'}</span>
          </div>
        </div>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Laufende Zeiterfassung bearbeiten</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <ProjectSelector
              project={formData.project}
              onProjectChange={handleProjectChange}
            />

            <TaskSelector
              value={formData.task}
              projectName={formData.project}
              onChange={(value) => setFormData({ ...formData, task: value })}
            />

            <CostCenterSelector
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
            />

            <LocationSelector
              location={formData.location}
              office_location_id={formData.office_location_id}
              onLocationChange={handleLocationChange}
              selectedOfficeName={selectedOfficeName}
              onOfficeNameChange={setSelectedOfficeName}
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notizen</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Optionale Notiz zur Zeiterfassung"
                className="border-[#3B44F6] rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-gray-300"
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#3B44F6] hover:bg-[#3B44F6]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PlanBreakDialog
        open={isPlanBreakOpen}
        onOpenChange={setIsPlanBreakOpen}
        currentEntry={currentEntry}
      />
    </>
  );
};

export default ActiveTimeEntryEditor;