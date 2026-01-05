
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SickLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SickLeaveDialog = ({ open, onOpenChange }: SickLeaveDialogProps) => {
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    notes: '',
    isChildSickLeave: false,
    childName: '',
    hasContactedDoctor: false,
    isPartialDay: false,
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Nicht angemeldet');
      }

      const { error } = await supabase
        .from('sick_leaves')
        .insert({
          user_id: user.id,
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate.toISOString(),
          reason: formData.reason,
          notes: formData.notes,
          is_child_sick_leave: formData.isChildSickLeave,
          child_name: formData.isChildSickLeave ? formData.childName : null,
          has_contacted_doctor: formData.hasContactedDoctor,
          is_partial_day: formData.isPartialDay,
          start_time: formData.isPartialDay ? formData.startTime : null,
          end_time: formData.isPartialDay ? formData.endTime : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Krankmeldung eingereicht",
        description: "Ihre Krankmeldung wurde erfolgreich eingereicht.",
      });

      onOpenChange(false);
      
      // Form zurücksetzen
      setFormData({
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        notes: '',
        isChildSickLeave: false,
        childName: '',
        hasContactedDoctor: false,
        isPartialDay: false,
        startTime: '',
        endTime: ''
      });

    } catch (error: any) {
      console.error('Fehler beim Speichern der Krankmeldung:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Krankmeldung konnte nicht gespeichert werden."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Krankmeldung</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, 'dd.MM.yyyy', { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.endDate, 'dd.MM.yyyy', { locale: de })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPartialDay"
              checked={formData.isPartialDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isPartialDay: checked as boolean })}
            />
            <Label htmlFor="isPartialDay">Teilweise arbeitsunfähig</Label>
          </div>

          {formData.isPartialDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Startzeit</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Endzeit</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Grund der Arbeitsunfähigkeit</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Beschreibung des Grundes..."
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isChildSickLeave"
              checked={formData.isChildSickLeave}
              onCheckedChange={(checked) => setFormData({ ...formData, isChildSickLeave: checked as boolean })}
            />
            <Label htmlFor="isChildSickLeave">Krankmeldung für krankes Kind</Label>
          </div>

          {formData.isChildSickLeave && (
            <div className="space-y-2">
              <Label htmlFor="childName">Name des Kindes</Label>
              <Input
                id="childName"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                placeholder="Name des kranken Kindes"
                required={formData.isChildSickLeave}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasContactedDoctor"
              checked={formData.hasContactedDoctor}
              onCheckedChange={(checked) => setFormData({ ...formData, hasContactedDoctor: checked as boolean })}
            />
            <Label htmlFor="hasContactedDoctor">Arzt kontaktiert</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Zusätzliche Hinweise</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Weitere Informationen (optional)..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : "Krankmeldung einreichen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
