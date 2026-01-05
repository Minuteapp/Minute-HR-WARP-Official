
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { TaskTimeTrackingDisplay } from "@/components/tasks/TaskTimeTrackingDisplay";
import { ProjectSelect } from "@/components/ProjectSelect";

interface TaskDetailsFormProps {
  reminder: string;
  setReminder: (reminder: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  project: string;
  setProject: (project: string) => void;
  tags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: () => void;
  autoTimeTracking: boolean;
  setAutoTimeTracking: (enabled: boolean) => void;
  onRemoveTag?: (tag: string) => void;
  taskId?: string;
  taskTitle?: string;
}

export const TaskDetailsForm = ({
  reminder,
  setReminder,
  notes,
  setNotes,
  project,
  setProject,
  tags,
  newTag,
  setNewTag,
  handleAddTag,
  autoTimeTracking,
  setAutoTimeTracking,
  onRemoveTag,
  taskId,
  taskTitle
}: TaskDetailsFormProps) => {
  const handleRemoveTag = (tagToRemove: string) => {
    if (onRemoveTag) {
      onRemoveTag(tagToRemove);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleReminderDateChange = (date?: Date) => {
    if (date) {
      setReminder(date.toISOString().split('T')[0]);
    } else {
      setReminder('');
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Erinnerung</Label>
          <DatePicker
            date={reminder ? new Date(reminder) : undefined}
            onChange={handleReminderDateChange}
            placeholder="Erinnerung setzen"
            className="w-full border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project" className="text-sm font-medium text-gray-700">Projekt</Label>
          <ProjectSelect
            value={project}
            onChange={setProject}
            placeholder="Projekt auswählen..."
          />
        </div>
      </div>

      {/* Zeiterfassung Bereich - für neue und bestehende Aufgaben */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Zeiterfassung
            </Label>
            <p className="text-sm text-gray-500">
              {taskId ? "Zeiterfassung für diese Aufgabe" : "Zeiterfassung nach dem Erstellen verfügbar"}
            </p>
          </div>
          <Switch
            id="autoTimeTracking"
            checked={autoTimeTracking}
            onCheckedChange={setAutoTimeTracking}
          />
        </div>
        
        {/* Wenn Aufgabe bereits existiert, zeige vollständige Zeiterfassung */}
        {taskId && taskTitle && (
          <TaskTimeTrackingDisplay
            taskId={taskId}
            taskTitle={taskTitle}
            autoTimeTracking={autoTimeTracking}
            onToggleAutoTracking={setAutoTimeTracking}
          />
        )}
        
        {/* Für neue Aufgaben zeige Info über kommende Zeiterfassung */}
        {!taskId && (
          <div className="text-sm text-gray-600 p-3 bg-white rounded border border-gray-200">
            <p className="mb-2">
              <strong>Nach dem Erstellen der Aufgabe können Sie:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Zeiterfassung starten/stoppen</li>
              <li>Manuelle Zeiten hinzufügen</li>
              <li>Automatische Zeiterfassung aktivieren</li>
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="bg-[#3B44F6] text-white border-[#3B44F6] hover:bg-[#2a35e8]">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 text-white hover:bg-white/20 hover:text-white"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Neuen Tag hinzufügen..."
            className="flex-1 border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
          />
          <Button 
            type="button"
            onClick={handleAddTag}
            variant="outline"
            className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notizen</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Zusätzliche Notizen..."
          rows={4}
          className="border-gray-300 focus:border-[#9b87f5] focus:ring-[#9b87f5]"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">
            Aufgaben-Einstellungen
          </Label>
          <p className="text-sm text-gray-500">
            Weitere Optionen für diese Aufgabe
          </p>
        </div>
      </div>
    </div>
  );
};
