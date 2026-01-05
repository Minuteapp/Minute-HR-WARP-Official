import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBAV } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Loader2 } from "lucide-react";

interface EditBAVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bav: any;
}

export const EditBAVDialog = ({ open, onOpenChange, bav }: EditBAVDialogProps) => {
  const updateBAV = useUpdateBAV();
  const [formData, setFormData] = useState({
    provider: bav?.provider || "",
    contract_number: bav?.contract_number || "",
    employer_contribution: bav?.employer_contribution || 0,
    employee_contribution: bav?.employee_contribution || 0,
    insurance_sum: bav?.insurance_sum || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateBAV.mutateAsync({
      id: bav.id,
      updates: formData,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>BAV bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Daten der betrieblichen Altersvorsorge.
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
            <Label htmlFor="contract_number">Vertragsnummer</Label>
            <Input
              id="contract_number"
              value={formData.contract_number}
              onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employer_contribution">AG-Beitrag (€)</Label>
              <Input
                id="employer_contribution"
                type="number"
                step="0.01"
                min="0"
                value={formData.employer_contribution}
                onChange={(e) => setFormData({ ...formData, employer_contribution: parseFloat(e.target.value) })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee_contribution">AN-Beitrag (€)</Label>
              <Input
                id="employee_contribution"
                type="number"
                step="0.01"
                min="0"
                value={formData.employee_contribution}
                onChange={(e) => setFormData({ ...formData, employee_contribution: parseFloat(e.target.value) })}
                required
              />
            </div>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateBAV.isPending}>
              {updateBAV.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
