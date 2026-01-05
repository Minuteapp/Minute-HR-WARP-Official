
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format, differenceInBusinessDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface VacationRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  department: string;
}

interface Employee {
  id: string;
  name: string;
}

export const VacationRequestDialog = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  department
}: VacationRequestDialogProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [vacationType, setVacationType] = useState<string>("Erholungsurlaub");
  const [substituteId, setSubstituteId] = useState<string>("");
  const [comments, setComments] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const vacationTypes = [
    { id: "Erholungsurlaub", name: "Erholungsurlaub" },
    { id: "Sonderurlaub", name: "Sonderurlaub" },
    { id: "Unbezahlter Urlaub", name: "Unbezahlter Urlaub" },
    { id: "Elternzeit", name: "Elternzeit" }
  ];

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-substitute"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name")
        .neq("id", employeeId)
        .order("name");

      if (error) throw error;
      return (data || []) as Employee[];
    },
  });

  const { data: remainingDays = 0 } = useQuery({
    queryKey: ["remaining-vacation-days", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacation_settings")
        .select("yearly_days, carry_over_days")
        .eq("user_id", employeeId)
        .maybeSingle();

      if (error) throw error;
      return ((data?.yearly_days || 0) + (data?.carry_over_days || 0));
    },
  });

  const calculateVacationDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInBusinessDays(endDate, startDate) + 1;
  };

  const handleSubmit = async () => {
    try {
      if (!startDate || !endDate || !vacationType) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive",
        });
        return;
      }

      const vacationDays = calculateVacationDays();

      // Hole Mitarbeiterdaten für den Abwesenheitsantrag
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, department')
        .eq('id', employeeId)
        .single();

      // Erstelle Eintrag in absence_requests für das Abwesenheits-Modul
      const { error: absenceError } = await supabase.from("absence_requests").insert({
        user_id: employeeId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: 'vacation',
        absence_type: 'vacation',
        status: "pending",
        reason: comments || `${vacationType} (${vacationDays} Tage)`,
        half_day: false,
        substitute_id: substituteId || null,
        employee_name: employeeData?.name || employeeName,
        department: employeeData?.department || department
      });

      if (absenceError) {
        console.error("Absence request error:", absenceError);
        throw absenceError;
      }

      // Erstelle zusätzlich Eintrag in vacation_requests für Kompatibilität
      const { error: vacationError } = await supabase.from("vacation_requests").insert({
        user_id: employeeId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        type: vacationType,
        notes: comments,
        status: "pending",
        substitute_id: substituteId || null
      });

      if (vacationError) {
        console.warn("Vacation request table error (ignoring):", vacationError);
        // Ignorieren, da der Haupteintrag in absence_requests erfolgreich erstellt wurde
      }

      toast({
        title: "Erfolg",
        description: "Der Urlaubsantrag wurde zur Genehmigung eingereicht.",
      });
      
      // Invalidiere alle relevanten Query-Keys
      queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['recent-absence-requests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      
      onClose();
    } catch (error) {
      console.error("Error submitting vacation request:", error);
      toast({
        title: "Fehler",
        description: "Der Urlaubsantrag konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    }
  };

  // Für die Kalenderfunktion einen Handler erstellen, der Typprobleme löst
  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    setStartDate(range.from);
    setEndDate(range.to);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Urlaubsantrag</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Mitarbeiter</label>
              <Input value={employeeName} disabled />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Abteilung</label>
              <Input value={department} disabled />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Urlaubsart</label>
              <Select value={vacationType} onValueChange={setVacationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Urlaubsart auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {vacationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Vertretung (optional)</label>
              <Select value={substituteId} onValueChange={setSubstituteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Vertretung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Zeitraum</label>
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate
                }}
                onSelect={handleDateRangeSelect}
                className="border rounded-md pointer-events-auto"
                numberOfMonths={2}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Urlaubstage</label>
              <Input value={calculateVacationDays()} disabled />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Resturlaub</label>
              <Input value={remainingDays - calculateVacationDays()} disabled />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Kommentar (optional)</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Zusätzliche Informationen..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Urlaubsantrag einreichen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
