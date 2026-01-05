
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface AutoTimeTrackingToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const AutoTimeTrackingToggle = ({
  enabled,
  onToggle
}: AutoTimeTrackingToggleProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-time-tracking" className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-[#9b87f5]" />
          Automatische Zeiterfassung
        </Label>
        <Switch
          id="auto-time-tracking"
          checked={enabled}
          onCheckedChange={onToggle}
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Automatische Zeiterfassung für diese Aufgabe aktivieren. Die Zeit wird ab dem Start der Aufgabe bis zum Abschluss oder manuellen Stopp gemessen.
      </p>
    </div>
  );
};
