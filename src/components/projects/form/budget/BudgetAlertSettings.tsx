
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

interface BudgetAlertSettingsProps {
  enableBudgetAlerts?: boolean;
  onChange: (field: string, value: any) => void;
}

export const BudgetAlertSettings = ({ enableBudgetAlerts = true, onChange }: BudgetAlertSettingsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="enableBudgetAlerts" 
        checked={enableBudgetAlerts}
        onCheckedChange={(checked) => onChange('enableBudgetAlerts', checked)}
      />
      <Label htmlFor="enableBudgetAlerts" className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        Benachrichtigungen aktivieren, wenn das Budget zu 75% aufgebraucht ist
      </Label>
    </div>
  );
};
