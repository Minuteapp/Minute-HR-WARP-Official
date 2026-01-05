import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateDisability } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Loader2 } from "lucide-react";

interface EditDisabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disability: any;
}

export const EditDisabilityDialog = ({ open, onOpenChange, disability }: EditDisabilityDialogProps) => {
  const updateDisability = useUpdateDisability();
  const [formData, setFormData] = useState({
    provider: disability?.provider || "",
    guaranteed_monthly_benefit: disability?.guaranteed_monthly_benefit || 0,
    employer_contribution: disability?.employer_contribution || 0,
    employee_contribution: disability?.employee_contribution || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateDisability.mutateAsync({
      id: disability.id,
      updates: formData,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>BU-Versicherung bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Daten der Berufsunfähigkeitsversicherung.
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
            <Label htmlFor="guaranteed_monthly_benefit">BU-Rente (€ / Monat)</Label>
            <Input
              id="guaranteed_monthly_benefit"
              type="number"
              step="0.01"
              min="0"
              value={formData.guaranteed_monthly_benefit}
              onChange={(e) => setFormData({ ...formData, guaranteed_monthly_benefit: parseFloat(e.target.value) })}
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
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateDisability.isPending}>
              {updateDisability.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
