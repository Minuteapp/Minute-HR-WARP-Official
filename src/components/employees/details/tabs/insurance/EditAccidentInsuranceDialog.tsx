import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateAccident } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Loader2 } from "lucide-react";

interface EditAccidentInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accident: any;
}

export const EditAccidentInsuranceDialog = ({ open, onOpenChange, accident }: EditAccidentInsuranceDialogProps) => {
  const updateAccident = useUpdateAccident();
  const [formData, setFormData] = useState({
    insurance_sum: accident?.insurance_sum || 0,
    death_benefit: accident?.death_benefit || 0,
    daily_allowance: accident?.daily_allowance || 0,
    hospital_daily_allowance: accident?.hospital_daily_allowance || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateAccident.mutateAsync({
      id: accident.id,
      updates: formData,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unfallversicherung bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Daten der Unfallversicherung.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="insurance_sum">Versicherungssumme (€)</Label>
            <Input
              id="insurance_sum"
              type="number"
              step="0.01"
              min="0"
              value={formData.insurance_sum}
              onChange={(e) => setFormData({ ...formData, insurance_sum: parseFloat(e.target.value) })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="death_benefit">Todesfallleistung (€)</Label>
            <Input
              id="death_benefit"
              type="number"
              step="0.01"
              min="0"
              value={formData.death_benefit}
              onChange={(e) => setFormData({ ...formData, death_benefit: parseFloat(e.target.value) })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_allowance">Tagegeld (€)</Label>
              <Input
                id="daily_allowance"
                type="number"
                step="0.01"
                min="0"
                value={formData.daily_allowance}
                onChange={(e) => setFormData({ ...formData, daily_allowance: parseFloat(e.target.value) })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hospital_daily_allowance">Krankenhaustagegeld (€)</Label>
              <Input
                id="hospital_daily_allowance"
                type="number"
                step="0.01"
                min="0"
                value={formData.hospital_daily_allowance}
                onChange={(e) => setFormData({ ...formData, hospital_daily_allowance: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateAccident.isPending}>
              {updateAccident.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
