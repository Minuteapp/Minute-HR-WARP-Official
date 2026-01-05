
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTemplateDialog({ open, onOpenChange }: NewTemplateDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_duration: 30,
    default_team_size: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        template_data: {
          default_duration: formData.default_duration,
          default_team_size: formData.default_team_size,
          required_roles: [],
          default_tasks: [],
        },
      };

      const { error } = await supabase
        .from('project_templates')
        .insert(templateData);

      if (error) throw error;

      toast({
        title: "Vorlage erstellt",
        description: "Die Projektvorlage wurde erfolgreich erstellt.",
      });

      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Projektvorlage erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name der Vorlage
            </label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Beschreibung
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="default_duration" className="text-sm font-medium">
                Standarddauer (Tage)
              </label>
              <Input
                id="default_duration"
                type="number"
                min="1"
                value={formData.default_duration}
                onChange={(e) => setFormData({ ...formData, default_duration: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="default_team_size" className="text-sm font-medium">
                Standard-Teamgröße
              </label>
              <Input
                id="default_team_size"
                type="number"
                min="1"
                value={formData.default_team_size}
                onChange={(e) => setFormData({ ...formData, default_team_size: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Wird erstellt..." : "Vorlage erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
