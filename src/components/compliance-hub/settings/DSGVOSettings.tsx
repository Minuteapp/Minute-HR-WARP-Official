import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RetentionPeriod {
  id: string;
  categoryName: string;
  period: string;
}

interface DSGVOSettingsProps {
  retentionPeriods?: RetentionPeriod[];
  autoAnonymize?: boolean;
  weeklyCheck?: boolean;
  autoDelete?: boolean;
  dsarDeadlineDays?: number;
  onPeriodAdjust?: (periodId: string) => void;
  onAutoAnonymizeChange?: (value: boolean) => void;
  onWeeklyCheckChange?: (value: boolean) => void;
  onAutoDeleteChange?: (value: boolean) => void;
  onDsarDeadlineChange?: (value: number) => void;
}

const defaultRetentionPeriods: RetentionPeriod[] = [
  { id: "employee", categoryName: "Mitarbeiterstammdaten", period: "10 Jahre nach Austritt" },
  { id: "contract", categoryName: "Vertragsdaten", period: "10 Jahre nach Vertragsende" },
  { id: "salary", categoryName: "Lohn & Gehaltsunterlagen", period: "10 Jahre (gesetzlich)" },
  { id: "application", categoryName: "Bewerbungsunterlagen", period: "6 Monate nach Absage" },
  { id: "performance", categoryName: "Leistungs- & Feedbackdaten", period: "3 Jahre nach Austritt" },
  { id: "timetracking", categoryName: "Zeiterfassungsdaten", period: "7 Jahre" },
  { id: "itlogs", categoryName: "IT-Logs", period: "1 Jahr" },
];

export const DSGVOSettings = ({
  retentionPeriods = defaultRetentionPeriods,
  autoAnonymize = false,
  weeklyCheck = false,
  autoDelete = false,
  dsarDeadlineDays,
  onPeriodAdjust,
  onAutoAnonymizeChange,
  onWeeklyCheckChange,
  onAutoDeleteChange,
  onDsarDeadlineChange,
}: DSGVOSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Aufbewahrungsfristen */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Aufbewahrungsfristen nach Datenkategorie</h3>
        <div className="space-y-2">
          {retentionPeriods.map((period) => (
            <Card key={period.id} className="border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{period.categoryName}</span>
                  <span className="text-sm text-muted-foreground ml-2">– {period.period}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPeriodAdjust?.(period.id)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  Anpassen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Automatische Jobs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Automatische Jobs</h3>
        <Card className="border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="autoAnonymize"
                checked={autoAnonymize}
                onCheckedChange={(checked) => onAutoAnonymizeChange?.(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="autoAnonymize" className="text-sm text-foreground">
                Automatische Anonymisierung nach Ablauf
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="weeklyCheck"
                checked={weeklyCheck}
                onCheckedChange={(checked) => onWeeklyCheckChange?.(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="weeklyCheck" className="text-sm text-foreground">
                Wöchentliche Prüfung auf überfällige Löschungen
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="autoDelete"
                checked={autoDelete}
                onCheckedChange={(checked) => onAutoDeleteChange?.(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="autoDelete" className="text-sm text-foreground">
                Automatische Löschung (ohne manuelle Freigabe)
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DSAR-Bearbeitungsfrist */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">DSAR-Bearbeitungsfrist (Tage)</Label>
        <Input
          type="number"
          value={dsarDeadlineDays ?? ""}
          onChange={(e) => onDsarDeadlineChange?.(parseInt(e.target.value) || 0)}
          placeholder="z.B. 30"
          className="max-w-xs"
        />
        <p className="text-xs text-muted-foreground">
          Gesetzliche Frist: 30 Tage (kann in komplexen Fällen um 60 Tage verlängert werden)
        </p>
      </div>
    </div>
  );
};
