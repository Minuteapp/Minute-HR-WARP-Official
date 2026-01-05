import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scenariosService } from "@/services/scenariosService";
import { useToast } from "@/hooks/use-toast";

interface CreateScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateScenarioDialog = ({ open, onOpenChange }: CreateScenarioDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    changes: ['']
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => scenariosService.createScenario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-scenarios'] });
      toast({
        title: 'Szenario erstellt',
        description: 'Das Szenario wurde erfolgreich erstellt.',
      });
      onOpenChange(false);
      setFormData({ name: '', description: '', changes: [''] });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Das Szenario konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description,
      changes: formData.changes.filter(c => c.trim() !== '')
    });
  };

  const addChange = () => {
    setFormData(prev => ({ ...prev, changes: [...prev.changes, ''] }));
  };

  const updateChange = (index: number, value: string) => {
    const newChanges = [...formData.changes];
    newChanges[index] = value;
    setFormData(prev => ({ ...prev, changes: newChanges }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Szenario erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="z.B. Abteilungszusammenlegung Q2 2025"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              placeholder="Beschreiben Sie das Szenario und seine Ziele..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Geplante Änderungen</Label>
            {formData.changes.map((change, index) => (
              <Input
                key={index}
                placeholder={`Änderung ${index + 1}`}
                value={change}
                onChange={(e) => updateChange(index, e.target.value)}
              />
            ))}
            <Button variant="outline" size="sm" onClick={addChange} className="w-full">
              + Weitere Änderung hinzufügen
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Erstelle...' : 'Szenario erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
