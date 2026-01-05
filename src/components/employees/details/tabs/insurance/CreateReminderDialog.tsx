import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CreateReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export const CreateReminderDialog = ({ open, onOpenChange, employeeId }: CreateReminderDialogProps) => {
  const [insuranceType, setInsuranceType] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!insuranceType || !reminderType || !reminderDate || !title) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("employee_insurance_reminders").insert({
        employee_id: employeeId,
        insurance_type: insuranceType,
        reminder_type: reminderType,
        reminder_date: reminderDate,
        title,
        description,
      });

      if (error) throw error;

      toast({
        title: "Erinnerung erstellt",
        description: "Die Erinnerung wurde erfolgreich erstellt.",
      });

      queryClient.invalidateQueries({ queryKey: ["insurance-reminders", employeeId] });
      onOpenChange(false);
      
      // Reset form
      setInsuranceType("");
      setReminderType("");
      setReminderDate("");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Fehler",
        description: "Die Erinnerung konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Versicherungs-Erinnerung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="insurance-type">Versicherungstyp *</Label>
            <Select value={insuranceType} onValueChange={setInsuranceType}>
              <SelectTrigger>
                <SelectValue placeholder="Versicherung auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bav">BAV</SelectItem>
                <SelectItem value="health">Krankenversicherung</SelectItem>
                <SelectItem value="disability">BU-Versicherung</SelectItem>
                <SelectItem value="accident">Unfallversicherung</SelectItem>
                <SelectItem value="life">Lebensversicherung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reminder-type">Erinnerungstyp *</Label>
            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract_expiry">Vertragsablauf</SelectItem>
                <SelectItem value="health_check">Gesundheitsprüfung</SelectItem>
                <SelectItem value="contribution_adjustment">Beitragsanpassung</SelectItem>
                <SelectItem value="annual_review">Jahresreview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reminder-date">Erinnerungsdatum *</Label>
            <Input
              id="reminder-date"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. BAV-Vertrag läuft aus"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Zusätzliche Details zur Erinnerung"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
