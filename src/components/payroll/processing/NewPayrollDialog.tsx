import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Euro, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const checklistItems = [
  { id: "timetracking", label: "Zeiterfassung vollständig geprüft", required: true },
  { id: "expenses", label: "Spesen und Auslagen freigegeben", required: true },
  { id: "bonuses", label: "Sonderzahlungen eingetragen", required: false },
  { id: "changes", label: "Personaländerungen aktualisiert", required: true },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const NewPayrollDialog = ({ open, onOpenChange }: NewPayrollDialogProps) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const { data: employeeCount = 0 } = useQuery({
    queryKey: ["employee-count-dialog"],
    queryFn: async () => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count || 0;
    }
  });

  const currentMonth = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const dueDate = new Date();
  dueDate.setDate(25);
  const dueDateFormatted = dueDate.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const estimatedAmount = (employeeCount || 247) * 3612;

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const requiredItemsChecked = checklistItems
    .filter(item => item.required)
    .every(item => checkedItems.includes(item.id));

  const handleStart = () => {
    onOpenChange(false);
    // Here you would trigger the actual payroll run
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Abrechnung starten</DialogTitle>
          <DialogDescription>
            Starten Sie den Abrechnungslauf für {currentMonth}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <div className="text-xl font-bold">{employeeCount || 247}</div>
                <div className="text-xs text-muted-foreground">Mitarbeiter</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <div className="text-xl font-bold">{dueDateFormatted}</div>
                <div className="text-xs text-muted-foreground">Fällig</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Euro className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <div className="text-xl font-bold">{formatCurrency(estimatedAmount)}</div>
                <div className="text-xs text-muted-foreground">Geschätzt</div>
              </CardContent>
            </Card>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Checkliste vor Start</h4>
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  checkedItems.includes(item.id) 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-muted/50"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={checkedItems.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <label 
                  htmlFor={item.id} 
                  className="flex-1 text-sm cursor-pointer"
                >
                  {item.label}
                  {item.required && <span className="text-destructive ml-1">*</span>}
                </label>
                {checkedItems.includes(item.id) && (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleStart}
            disabled={!requiredItemsChecked}
          >
            Abrechnung starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
