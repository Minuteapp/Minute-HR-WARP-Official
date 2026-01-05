
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBudgetTemplate } from '@/hooks/useBudgetTemplates';

interface CreateBudgetTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBudgetTemplateDialog = ({ open, onOpenChange }: CreateBudgetTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_type: '',
  });

  const createTemplateMutation = useCreateBudgetTemplate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createTemplateMutation.mutate({
      ...formData,
      budget_categories: [],
      fields: [],
      default_values: {},
      is_active: true,
    });

    if (!createTemplateMutation.isPending) {
      onOpenChange(false);
      setFormData({ name: '', description: '', template_type: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Budget-Vorlage erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Vorlage für Budget-Pläne.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name der Vorlage"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="template_type">Typ</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vorlagen-Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Projekt</SelectItem>
                  <SelectItem value="department">Abteilung</SelectItem>
                  <SelectItem value="annual">Jahresbudget</SelectItem>
                  <SelectItem value="campaign">Kampagne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibung der Vorlage"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
