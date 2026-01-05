import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NotificationRule {
  id: string;
  title: string;
  recipients: string[];
  enabled: boolean;
}

interface EscalationLevel {
  level: number;
  title: string;
  description: string;
  color: "gray" | "yellow" | "orange" | "red";
}

interface NotificationSettingsProps {
  notificationRules?: NotificationRule[];
  escalationLevels?: EscalationLevel[];
  onRuleChange?: (ruleId: string, enabled: boolean) => void;
}

const defaultNotificationRules: NotificationRule[] = [
  { id: "worktime", title: "Arbeitszeitverstoß (kritisch)", recipients: ["HR", "Compliance", "Standortleitung"], enabled: false },
  { id: "training", title: "Pflichtschulung überfällig (> 30 Tage)", recipients: ["HR", "Vorgesetzte"], enabled: false },
  { id: "dsgvo", title: "DSGVO-Anfrage eingegangen", recipients: ["DPO", "HR"], enabled: false },
  { id: "expenses", title: "Spesen-Policy-Verstoß (> 20%)", recipients: ["Finance", "Compliance"], enabled: false },
  { id: "card", title: "Firmenkarte: Transaktion ohne Beleg (> 7 Tage)", recipients: ["Finance", "Vorgesetzte"], enabled: false },
  { id: "offboarding", title: "IT-Zugang nach Offboarding aktiv (> 24h)", recipients: ["IT-Security", "HR"], enabled: false },
];

const defaultEscalationLevels: EscalationLevel[] = [
  { level: 1, title: "Mitarbeiter", description: "Automatische E-Mail-Benachrichtigung", color: "gray" },
  { level: 2, title: "Teamleiter / Vorgesetzte", description: "Nach 7 Tagen ohne Reaktion", color: "yellow" },
  { level: 3, title: "HR", description: "Nach 14 Tagen ohne Reaktion", color: "orange" },
  { level: 4, title: "Compliance / Legal", description: "Nach 21 Tagen oder bei kritischen Verstößen sofort", color: "red" },
];

const getEscalationStyles = (color: EscalationLevel["color"]) => {
  switch (color) {
    case "gray":
      return "bg-gray-50 border-gray-200";
    case "yellow":
      return "bg-yellow-50 border-yellow-200";
    case "orange":
      return "bg-orange-50 border-orange-200";
    case "red":
      return "bg-orange-100 border-orange-300";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const getEscalationTitleStyles = (color: EscalationLevel["color"]) => {
  switch (color) {
    case "gray":
      return "text-gray-700";
    case "yellow":
      return "text-yellow-700";
    case "orange":
      return "text-orange-600";
    case "red":
      return "text-orange-700";
    default:
      return "text-gray-700";
  }
};

export const NotificationSettings = ({
  notificationRules = defaultNotificationRules,
  escalationLevels = defaultEscalationLevels,
  onRuleChange,
}: NotificationSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Benachrichtigungsregeln */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Benachrichtigen bei kritischen Verstößen</h3>
        <div className="space-y-2">
          {notificationRules.map((rule) => (
            <Card key={rule.id} className="border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={rule.enabled}
                    onCheckedChange={(checked) => onRuleChange?.(rule.id, checked as boolean)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">{rule.title}</div>
                    <div className="text-xs text-muted-foreground">
                      An: {rule.recipients.join(", ")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Eskalationsstufen */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Eskalationsstufen</h3>
        <div className="space-y-3">
          {escalationLevels.map((level) => (
            <Card
              key={level.level}
              className={cn("border", getEscalationStyles(level.color))}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    level.color === "gray" && "bg-gray-200 text-gray-600",
                    level.color === "yellow" && "bg-yellow-200 text-yellow-700",
                    level.color === "orange" && "bg-orange-200 text-orange-700",
                    level.color === "red" && "bg-orange-300 text-orange-800"
                  )}>
                    {level.level}
                  </div>
                  <div>
                    <div className={cn("text-sm font-medium", getEscalationTitleStyles(level.color))}>
                      Stufe {level.level}: {level.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
