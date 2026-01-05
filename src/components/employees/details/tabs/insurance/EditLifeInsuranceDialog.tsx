import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateLife } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Loader2 } from "lucide-react";

interface EditLifeInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  life: any;
}

export const EditLifeInsuranceDialog = ({ open, onOpenChange, life }: EditLifeInsuranceDialogProps) => {
  const updateLife = useUpdateLife();
  const [formData, setFormData] = useState({
    provider: life?.provider || "",
    insurance_sum: life?.insurance_sum || 0,
    beneficiaries: life?.beneficiaries || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateLife.mutateAsync({
      id: life.id,
      updates: formData,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lebensversicherung bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Daten der Lebensversicherung.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Anbieter</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              required
            />
          </div>
          
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
            <Label htmlFor="beneficiaries">Bezugsberechtigte</Label>
            <Input
              id="beneficiaries"
              value={formData.beneficiaries}
              onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
              placeholder="z.B. Ehepartner, Kinder"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateLife.isPending}>
              {updateLife.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
