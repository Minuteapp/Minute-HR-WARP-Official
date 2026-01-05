import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MandatoryTraining {
  roleId: string;
  roleName: string;
  courses: string[];
}

interface RecertificationInterval {
  id: string;
  name: string;
  interval: string;
}

interface TrainingSettingsProps {
  mandatoryTrainings?: MandatoryTraining[];
  recertificationIntervals?: RecertificationInterval[];
  firstReminderDays?: number;
  escalationDays?: number;
  onIntervalChange?: (intervalId: string, value: string) => void;
  onFirstReminderChange?: (value: number) => void;
  onEscalationChange?: (value: number) => void;
}

const defaultMandatoryTrainings: MandatoryTraining[] = [
  { roleId: "all", roleName: "Alle Mitarbeitende", courses: ["Datenschutz", "IT-Security", "Code of Conduct"] },
  { roleId: "production", roleName: "Produktion & Lager", courses: ["+ Arbeitssicherheit", "Erste Hilfe"] },
  { roleId: "managers", roleName: "Führungskräfte", courses: ["+ Arbeitsrecht für Führungskräfte", "Anti-Harassment"] },
  { roleId: "management", roleName: "Management", courses: ["+ Compliance & Anti-Korruption"] },
  { roleId: "cardholders", roleName: "Karteninhaber", courses: ["+ Firmenkarten-Richtlinien"] },
];

const defaultRecertificationIntervals: RecertificationInterval[] = [
  { id: "safety", name: "Arbeitssicherheit", interval: "" },
  { id: "privacy", name: "Datenschutz", interval: "" },
  { id: "it-security", name: "IT-Security", interval: "" },
  { id: "compliance", name: "Compliance", interval: "" },
];

export const TrainingSettings = ({
  mandatoryTrainings = defaultMandatoryTrainings,
  recertificationIntervals = defaultRecertificationIntervals,
  firstReminderDays,
  escalationDays,
  onIntervalChange,
  onFirstReminderChange,
  onEscalationChange,
}: TrainingSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Pflichtkurse nach Rolle */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Pflichtkurse nach Rolle/Standort</h3>
        <div className="space-y-2">
          {mandatoryTrainings.map((training) => (
            <Card key={training.roleId} className="border bg-card">
              <CardContent className="p-4">
                <div className="font-medium text-foreground">{training.roleName}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {training.courses.join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rezertifizierungsintervalle */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Rezertifizierungsintervalle</h3>
        <div className="grid grid-cols-2 gap-4">
          {recertificationIntervals.map((interval) => (
            <div key={interval.id} className="space-y-2">
              <Label className="text-sm font-medium text-foreground">{interval.name}</Label>
              <Select
                value={interval.interval}
                onValueChange={(value) => onIntervalChange?.(interval.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Intervall auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                  <SelectItem value="2years">Alle 2 Jahre</SelectItem>
                  <SelectItem value="3years">Alle 3 Jahre</SelectItem>
                  <SelectItem value="5years">Alle 5 Jahre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Eskalation bei Nichtteilnahme */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Eskalation bei Nichtteilnahme</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Erste Erinnerung (Tage vor Fälligkeit)</Label>
            <Input
              type="number"
              value={firstReminderDays ?? ""}
              onChange={(e) => onFirstReminderChange?.(parseInt(e.target.value) || 0)}
              placeholder="z.B. 14"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Eskalation an Vorgesetzte (Tage überfällig)</Label>
            <Input
              type="number"
              value={escalationDays ?? ""}
              onChange={(e) => onEscalationChange?.(parseInt(e.target.value) || 0)}
              placeholder="z.B. 7"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
