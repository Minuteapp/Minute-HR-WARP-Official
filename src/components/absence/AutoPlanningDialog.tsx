
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { PlanningPeriod } from '@/types/shifts';

interface AutoPlanningDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPeriod: PlanningPeriod;
  onPeriodChange: (period: PlanningPeriod) => void;
  currentDate: Date;
  onSuccess: () => void;
}

export const AutoPlanningDialog = ({
  isOpen,
  onOpenChange,
  selectedPeriod,
  onPeriodChange,
  currentDate,
  onSuccess
}: AutoPlanningDialogProps) => {
  const { toast } = useToast();

  const handleAutoPlan = async () => {
    try {
      const response = await supabase.functions.invoke('auto-plan-shifts', {
        body: {
          period: selectedPeriod,
          date: format(currentDate, 'yyyy-MM-dd'),
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Automatische Planung erfolgreich",
        description: `Die Schichten wurden für ${selectedPeriod === 'day' ? 'den Tag' : 
          selectedPeriod === 'week' ? 'die Woche' : 'den Monat'} geplant.`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error auto-planning shifts:', error);
      toast({
        title: "Fehler bei der automatischen Planung",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Automatisch planen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Automatische Planung</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Planungszeitraum</label>
            <Select
              value={selectedPeriod}
              onValueChange={onPeriodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Zeitraum wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Einen Tag</SelectItem>
                <SelectItem value="week">Eine Woche</SelectItem>
                <SelectItem value="month">Einen Monat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAutoPlan} className="w-full">
            Planung starten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
