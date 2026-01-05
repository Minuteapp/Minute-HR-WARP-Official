import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkingTimeRules {
  locationId: string;
  maxDailyHours: number;
  maxWeeklyHours: number;
  restHoursBetweenShifts: number;
  breakMinutesAfter6Hours: number;
  exceptions: {
    shiftWorkRules: boolean;
    autoValidation: boolean;
    realtimeWarnings: boolean;
  };
}

interface WorkingTimeRulesSettingsProps {
  rules?: WorkingTimeRules;
  selectedLocation?: string;
  onLocationChange?: (value: string) => void;
  onRulesChange?: (rules: Partial<WorkingTimeRules>) => void;
  onExceptionChange?: (key: keyof WorkingTimeRules["exceptions"], value: boolean) => void;
}

const defaultRules: WorkingTimeRules = {
  locationId: "",
  maxDailyHours: 0,
  maxWeeklyHours: 0,
  restHoursBetweenShifts: 0,
  breakMinutesAfter6Hours: 0,
  exceptions: {
    shiftWorkRules: false,
    autoValidation: false,
    realtimeWarnings: false,
  },
};

export const WorkingTimeRulesSettings = ({
  rules = defaultRules,
  selectedLocation = "",
  onLocationChange,
  onRulesChange,
  onExceptionChange,
}: WorkingTimeRulesSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Standort auswählen */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Arbeitszeitregeln nach Standort</h3>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Standort auswählen</Label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Standort auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="at-all">Österreich (alle Standorte)</SelectItem>
              <SelectItem value="de-all">Deutschland (alle Standorte)</SelectItem>
              <SelectItem value="ch-all">Schweiz (alle Standorte)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Arbeitszeitfelder */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Maximalarbeitszeit pro Tag (Stunden)</Label>
          <Input
            type="number"
            value={rules.maxDailyHours || ""}
            onChange={(e) => onRulesChange?.({ maxDailyHours: parseInt(e.target.value) || 0 })}
            placeholder="z.B. 10"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Maximalarbeitszeit pro Woche (Stunden)</Label>
          <Input
            type="number"
            value={rules.maxWeeklyHours || ""}
            onChange={(e) => onRulesChange?.({ maxWeeklyHours: parseInt(e.target.value) || 0 })}
            placeholder="z.B. 48"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Ruhezeit zwischen Schichten (Stunden)</Label>
          <Input
            type="number"
            value={rules.restHoursBetweenShifts || ""}
            onChange={(e) => onRulesChange?.({ restHoursBetweenShifts: parseInt(e.target.value) || 0 })}
            placeholder="z.B. 11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Pausenzeit bei 6+h Arbeit (Minuten)</Label>
          <Input
            type="number"
            value={rules.breakMinutesAfter6Hours || ""}
            onChange={(e) => onRulesChange?.({ breakMinutesAfter6Hours: parseInt(e.target.value) || 0 })}
            placeholder="z.B. 30"
          />
        </div>
      </div>

      {/* Ausnahmen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Ausnahmen</h3>
        <Card className="border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="shiftWorkRules"
                checked={rules.exceptions.shiftWorkRules}
                onCheckedChange={(checked) => onExceptionChange?.("shiftWorkRules", checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="shiftWorkRules" className="text-sm text-foreground">
                Sonderregelungen für Schichtbetrieb
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="autoValidation"
                checked={rules.exceptions.autoValidation}
                onCheckedChange={(checked) => onExceptionChange?.("autoValidation", checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="autoValidation" className="text-sm text-foreground">
                Automatische Validierung bei Schichtplanung
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="realtimeWarnings"
                checked={rules.exceptions.realtimeWarnings}
                onCheckedChange={(checked) => onExceptionChange?.("realtimeWarnings", checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="realtimeWarnings" className="text-sm text-foreground">
                Echtzeit-Warnungen bei Verstößen
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
