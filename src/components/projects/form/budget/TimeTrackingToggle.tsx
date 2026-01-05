
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";

interface TimeTrackingToggleProps {
  enableTimeTracking?: boolean;
  onChange: (field: string, value: any) => void;
}

export const TimeTrackingToggle = ({ enableTimeTracking = false, onChange }: TimeTrackingToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="enableTimeTracking" 
        checked={enableTimeTracking}
        onCheckedChange={(checked) => onChange('enableTimeTracking', checked)}
      />
      <Label htmlFor="enableTimeTracking" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Zeiterfassung für dieses Projekt aktivieren
      </Label>
    </div>
  );
};
