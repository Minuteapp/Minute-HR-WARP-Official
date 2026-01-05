
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectTemplate } from "@/types/project.types";
import { X } from "lucide-react";

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ProjectTemplate | null;
}

export function EditTemplateDialog({ open, onOpenChange, template }: EditTemplateDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    default_duration: 30,
    default_team_size: 1,
    required_roles: [] as string[],
    new_role: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        default_duration: template.template_data.default_duration || 30,
        default_team_size: template.template_data.default_team_size || 1,
        required_roles: template.template_data.required_roles || [],
        new_role: "",
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    
    setIsLoading(true);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        template_data: {
          default_duration: formData.default_duration,
          default_team_size: formData.default_team_size,
          required_roles: formData.required_roles,
          default_tasks: template.template_data.default_tasks || [],
        },
      };

      const { error } = await supabase
        .from('project_templates')
        .update(templateData)
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: "Vorlage aktualisiert",
        description: "Die Projektvorlage wurde erfolgreich aktualisiert.",
      });

      queryClient.invalidateQueries({ queryKey: ['project-templates'] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Fehler",
        description: "Die Vorlage konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRole = () => {
    if (formData.new_role.trim()) {
      setFormData(prev => ({
        ...prev,
        required_roles: [...prev.required_roles, prev.new_role.trim()],
        new_role: "",
      }));
    }
  };

  const removeRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_roles: prev.required_roles.filter(role => role !== roleToRemove),
    }));
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Projektvorlage bearbeiten</DialogTitle>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Benötigte Rollen</label>
            <div className="flex gap-2">
              <Input
                value={formData.new_role}
                onChange={(e) => setFormData({ ...formData, new_role: e.target.value })}
                placeholder="Neue Rolle hinzufügen"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              />
              <Button type="button" onClick={addRole}>
                Hinzufügen
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.required_roles.map((role, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
