import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateHealthInsurance } from "@/integrations/supabase/hooks/useEmployeeInsurance";
import { Loader2 } from "lucide-react";

interface EditHealthInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  health: any;
}

export const EditHealthInsuranceDialog = ({ open, onOpenChange, health }: EditHealthInsuranceDialogProps) => {
  const updateHealth = useUpdateHealthInsurance();
  const [formData, setFormData] = useState({
    provider: health?.provider || "",
    member_number: health?.member_number || "",
    employer_contribution: health?.employer_contribution || 0,
    employee_contribution: health?.employee_contribution || 0,
    additional_contribution: health?.additional_contribution || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateHealth.mutateAsync({
      id: health.id,
      updates: formData,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Krankenversicherung bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Daten der Krankenversicherung.
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
            <Label htmlFor="member_number">Mitgliedsnummer</Label>
            <Input
              id="member_number"
              value={formData.member_number}
              onChange={(e) => setFormData({ ...formData, member_number: e.target.value })}
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
            <Label htmlFor="additional_contribution">Zusatzbeitrag (€)</Label>
            <Input
              id="additional_contribution"
              type="number"
              step="0.01"
              min="0"
              value={formData.additional_contribution}
              onChange={(e) => setFormData({ ...formData, additional_contribution: parseFloat(e.target.value) })}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateHealth.isPending}>
              {updateHealth.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
