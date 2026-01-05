
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrgStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node?: any;
  onSuccess: () => void;
}

export const OrgStructureDialog = ({ open, onOpenChange, node, onSuccess }: OrgStructureDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    level: 0,
    manager_id: '',
    budget_allocation: 0,
    cost_center: '',
    metadata: {}
  });

  const queryClient = useQueryClient();

  const { data: parentNodes } = useQuery({
    queryKey: ['parent-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('id, name, level')
        .order('level', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: managers } = useQuery({
    queryKey: ['potential-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('organizational_structure')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizational-structure'] });
      toast.success("Organisationseinheit erfolgreich erstellt");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('organizational_structure')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizational-structure'] });
      toast.success("Organisationseinheit erfolgreich aktualisiert");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    }
  });

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.name || '',
        description: node.description || '',
        parent_id: node.parent_id || '',
        level: node.level || 0,
        manager_id: node.manager_id || '',
        budget_allocation: node.budget_allocation || 0,
        cost_center: node.cost_center || '',
        metadata: node.metadata || {}
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: '',
        level: 0,
        manager_id: '',
        budget_allocation: 0,
        cost_center: '',
        metadata: {}
      });
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (node) {
      updateMutation.mutate({ id: node.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {node ? 'Organisationseinheit bearbeiten' : 'Neue Organisationseinheit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="parent">Übergeordnete Einheit</Label>
            <Select
              value={formData.parent_id}
              onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Übergeordnete Einheit wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine (Haupteinheit)</SelectItem>
                {parentNodes?.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name} (Level {parent.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="manager">Manager</Label>
            <Select
              value={formData.manager_id}
              onValueChange={(value) => setFormData({ ...formData, manager_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Manager wählen" />
              </SelectTrigger>
              <SelectContent>
                {managers?.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} - {manager.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="costCenter">Kostenstelle</Label>
            <Input
              id="costCenter"
              value={formData.cost_center}
              onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget-Allokation (EUR)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget_allocation}
              onChange={(e) => setFormData({ ...formData, budget_allocation: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {node ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
