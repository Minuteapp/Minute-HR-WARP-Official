
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsSectionProps {
  taskView: string;
  useTaskTemplate: string;
  enableNotifications?: boolean;
  integrateExternalTools?: boolean;
  saveAsTemplate?: boolean;
  onChange: (field: string, value: any) => void;
}

export function SettingsSection({
  taskView,
  useTaskTemplate,
  enableNotifications = true,
  integrateExternalTools = false,
  saveAsTemplate = false,
  onChange,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Projekt-Einstellungen</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskView">Aufgabenansicht</Label>
            <Select
              value={taskView}
              onValueChange={(value) => onChange('taskView', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Ansicht" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban-Board</SelectItem>
                <SelectItem value="list">Listenansicht</SelectItem>
                <SelectItem value="gantt">Gantt-Diagramm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="useTaskTemplate">Aufgabenvorlage verwenden</Label>
            <Select
              value={useTaskTemplate}
              onValueChange={(value) => onChange('useTaskTemplate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Vorlage (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard-Aufgaben</SelectItem>
                <SelectItem value="scrum">Scrum-Aufgaben</SelectItem>
                <SelectItem value="development">Entwicklungsprojekt</SelectItem>
                <SelectItem value="marketing">Marketingprojekt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="enableNotifications">Benachrichtigungen aktivieren</Label>
            <Switch
              id="enableNotifications"
              checked={enableNotifications}
              onCheckedChange={(checked) => onChange('enableNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="integrateExternalTools">Externe Tools einbinden</Label>
            <Switch
              id="integrateExternalTools"
              checked={integrateExternalTools}
              onCheckedChange={(checked) => onChange('integrateExternalTools', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="saveAsTemplate">Als Vorlage speichern</Label>
            <Switch
              id="saveAsTemplate"
              checked={saveAsTemplate}
              onCheckedChange={(checked) => onChange('saveAsTemplate', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
