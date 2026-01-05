import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateRiskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateRiskDialog = ({ open, onOpenChange, onSuccess }: CreateRiskDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: '',
    category: '',
    risk_description: '',
    risk_level: 'medium',
    deadline: '',
    responsible_person: '',
    status: 'open'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('global_mobility_risks')
        .insert({
          employee_name: formData.employee_name,
          category: formData.category,
          risk_description: formData.risk_description,
          risk_level: formData.risk_level,
          deadline: formData.deadline || null,
          responsible_person: formData.responsible_person || null,
          status: formData.status
        });

      if (error) throw error;

      toast({
        title: "Risiko erfasst",
        description: "Das Risiko wurde erfolgreich angelegt."
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        employee_name: '',
        category: '',
        risk_description: '',
        risk_level: 'medium',
        deadline: '',
        responsible_person: '',
        status: 'open'
      });
    } catch (error) {
      console.error('Error creating risk:', error);
      toast({
        title: "Fehler",
        description: "Das Risiko konnte nicht erstellt werden.",
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
          <DialogTitle>Neues Risiko erfassen</DialogTitle>
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
                <SelectItem value="visa">Visa-Ablauf</SelectItem>
                <SelectItem value="tax">Steuerliche Risiken</SelectItem>
                <SelectItem value="compliance">Compliance-Verstöße</SelectItem>
                <SelectItem value="operational">Operative Risiken</SelectItem>
                <SelectItem value="legal">Rechtliche Risiken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_description">Risikobeschreibung *</Label>
            <Textarea
              id="risk_description"
              value={formData.risk_description}
              onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="risk_level">Risiko-Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value) => setFormData({ ...formData, risk_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Kritisch</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Frist</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible_person">Verantwortlich</Label>
            <Input
              id="responsible_person"
              value={formData.responsible_person}
              onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
            />
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
