import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  eventTypes: string[];
  showAllDay: boolean;
  showRecurring: boolean;
  showPrivate: boolean;
}

const eventTypeOptions = [
  { value: "appointment", label: "Termine" },
  { value: "meeting", label: "Besprechungen" },
  { value: "task", label: "Aufgaben" },
  { value: "reminder", label: "Erinnerungen" },
  { value: "absence", label: "Abwesenheiten" },
  { value: "project", label: "Projekte" },
];

export function FilterDialog({ open, onOpenChange, onApplyFilters }: FilterDialogProps) {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    eventTypeOptions.map(opt => opt.value)
  );
  const [showAllDay, setShowAllDay] = useState(true);
  const [showRecurring, setShowRecurring] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);

  const handleEventTypeToggle = (value: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      eventTypes: selectedEventTypes,
      showAllDay,
      showRecurring,
      showPrivate,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setSelectedEventTypes(eventTypeOptions.map(opt => opt.value));
    setShowAllDay(true);
    setShowRecurring(true);
    setShowPrivate(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kalender filtern</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Termintypen */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Termintypen</Label>
            <div className="space-y-2">
              {eventTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedEventTypes.includes(option.value)}
                    onCheckedChange={() => handleEventTypeToggle(option.value)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Weitere Optionen */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Optionen</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-day"
                  checked={showAllDay}
                  onCheckedChange={(checked) => setShowAllDay(checked as boolean)}
                />
                <Label htmlFor="all-day" className="text-sm font-normal cursor-pointer">
                  Ganztägige Termine anzeigen
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={showRecurring}
                  onCheckedChange={(checked) => setShowRecurring(checked as boolean)}
                />
                <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                  Wiederkehrende Termine anzeigen
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="private"
                  checked={showPrivate}
                  onCheckedChange={(checked) => setShowPrivate(checked as boolean)}
                />
                <Label htmlFor="private" className="text-sm font-normal cursor-pointer">
                  Private Termine anzeigen
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Zurücksetzen
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleApply}>
              Anwenden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
