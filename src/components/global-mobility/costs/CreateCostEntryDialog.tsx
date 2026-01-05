import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateCostEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateCostEntryDialog = ({ open, onOpenChange, onSuccess }: CreateCostEntryDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: '',
    category: '',
    description: '',
    budget_amount: '',
    actual_amount: '',
    cost_center: '',
    status: 'planned'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('global_mobility_cost_entries')
        .insert({
          employee_name: formData.employee_name,
          category: formData.category,
          description: formData.description || null,
          budget_amount: formData.budget_amount ? parseFloat(formData.budget_amount) : null,
          actual_amount: formData.actual_amount ? parseFloat(formData.actual_amount) : null,
          cost_center: formData.cost_center || null,
          status: formData.status
        });

      if (error) throw error;

      toast({
        title: "Kosteneintrag erstellt",
        description: "Der Kosteneintrag wurde erfolgreich angelegt."
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        employee_name: '',
        category: '',
        description: '',
        budget_amount: '',
        actual_amount: '',
        cost_center: '',
        status: 'planned'
      });
    } catch (error) {
      console.error('Error creating cost entry:', error);
      toast({
        title: "Fehler",
        description: "Der Kosteneintrag konnte nicht erstellt werden.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neuer Kosteneintrag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_name">Mitarbeiter *</Label>
            <Input
              id="employee_name"
              value={formData.employee_name}
              onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relocation">Relocation-Kosten</SelectItem>
                <SelectItem value="housing">Wohnkosten</SelectItem>
                <SelectItem value="travel">Reisekosten</SelectItem>
                <SelectItem value="taxes">Steuern & Abgaben</SelectItem>
                <SelectItem value="benefits">Zusatzleistungen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_amount">Budget (€)</Label>
              <Input
                id="budget_amount"
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_amount">Ist-Kosten (€)</Label>
              <Input
                id="actual_amount"
                type="number"
                step="0.01"
                value={formData.actual_amount}
                onChange={(e) => setFormData({ ...formData, actual_amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_center">Kostenstelle</Label>
            <Input
              id="cost_center"
              value={formData.cost_center}
              onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
