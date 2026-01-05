import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Plus } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { useInsuranceReminders } from "@/integrations/supabase/hooks/useEmployeePerformance";
import { useState } from "react";
import { CreateReminderDialog } from "./CreateReminderDialog";

interface InsuranceRemindersProps {
  employeeId: string;
}

export const InsuranceReminders = ({ employeeId }: InsuranceRemindersProps) => {
  const { data: reminders, isLoading } = useInsuranceReminders(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  const getUrgencyBadge = (reminderDate: string) => {
    const daysUntil = differenceInDays(new Date(reminderDate), new Date());
    
    if (daysUntil < 0) {
      return <Badge className="bg-red-500">Überfällig</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge className="bg-red-500">Dringend</Badge>;
    } else if (daysUntil <= 30) {
      return <Badge className="bg-yellow-500">Bald fällig</Badge>;
    } else {
      return <Badge className="bg-green-500">Geplant</Badge>;
    }
  };

  const getInsuranceTypeLabel = (type: string) => {
    switch (type) {
      case "bav":
        return "BAV";
      case "health":
        return "Krankenversicherung";
      case "disability":
        return "BU-Versicherung";
      case "accident":
        return "Unfallversicherung";
      case "life":
        return "Lebensversicherung";
      default:
        return type;
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "contract_expiry":
        return "Vertragsablauf";
      case "health_check":
        return "Gesundheitsprüfung";
      case "contribution_adjustment":
        return "Beitragsanpassung";
      case "annual_review":
        return "Jahresreview";
      default:
        return type;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Versicherungs-Erinnerungen
            </CardTitle>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neue Erinnerung
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!reminders || reminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Keine anstehenden Erinnerungen
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder: any) => (
                <Card key={reminder.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox id={reminder.id} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getInsuranceTypeLabel(reminder.insurance_type)}
                            </Badge>
                            <Badge variant="outline">
                              {getReminderTypeLabel(reminder.reminder_type)}
                            </Badge>
                          </div>
                          {getUrgencyBadge(reminder.reminder_date)}
                        </div>
                        <h4 className="font-semibold mb-1">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {reminder.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Fällig am: {format(new Date(reminder.reminder_date), "dd. MMMM yyyy", { locale: de })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employeeId={employeeId}
      />
    </>
  );
};
