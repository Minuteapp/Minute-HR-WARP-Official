
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGoalTemplate, useGoalTemplateCategories } from '@/hooks/useGoalTemplates';
import type { GoalTemplateCategoryType, GoalTemplateType, TemplateAccessLevel } from '@/types/goalTemplates';

interface CreateGoalTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateGoalTemplateDialog = ({ open, onOpenChange }: CreateGoalTemplateDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'personal' as GoalTemplateCategoryType,
    template_type: 'smart' as GoalTemplateType,
    is_public: false,
    access_level: 'all' as TemplateAccessLevel,
  });

  const createTemplate = useCreateGoalTemplate();
  const { data: categories = [] } = useGoalTemplateCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      await createTemplate.mutateAsync({
        ...formData,
        fields: [
          {
            name: 'title',
            label: 'Titel',
            type: 'text',
            required: true,
            placeholder: 'Ziel-Titel eingeben...'
          },
          {
            name: 'description',
            label: 'Beschreibung',
            type: 'textarea',
            required: false,
            placeholder: 'Beschreibung des Ziels...'
          }
        ],
        default_values: {},
        validation_rules: {},
        required_roles: ['employee'],
        metadata: {}
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'personal',
        template_type: 'smart',
        is_public: false,
        access_level: 'all',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Templates:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Ziel-Template erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Template-Name eingeben..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung des Templates..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Select
              value={formData.category}
              onValueChange={(value: GoalTemplateCategoryType) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Persönlich</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="company">Unternehmen</SelectItem>
                <SelectItem value="development">Entwicklung</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="template_type">Template-Typ</Label>
            <Select
              value={formData.template_type}
              onValueChange={(value: GoalTemplateType) => 
                setFormData(prev => ({ ...prev, template_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Template-Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smart">SMART</SelectItem>
                <SelectItem value="okr">OKR</SelectItem>
                <SelectItem value="development">Entwicklung</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="project">Projekt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
