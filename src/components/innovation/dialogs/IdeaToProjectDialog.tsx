import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Target, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IdeaToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    tags?: string[];
    submitter_id: string;
  };
  onSuccess?: (projectId: string) => void;
}

export const IdeaToProjectDialog: React.FC<IdeaToProjectDialogProps> = ({
  open,
  onOpenChange,
  idea,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: idea.title,
    description: idea.description || '',
    category: idea.category || '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    budget: '',
    startDate: '',
    dueDate: '',
    responsiblePerson: '',
    tags: idea.tags || [],
    status: 'planning' as const
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nicht authentifiziert');

      // Erstelle Projekt
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          category: formData.category,
          tags: formData.tags,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          start_date: formData.startDate || null,
          end_date: formData.dueDate || null,
          responsible_person: formData.responsiblePerson || null,
          created_by: user.id,
          project_type: 'innovation',
          progress: 0,
          // Verknüpfe mit ursprünglicher Idee
          source_idea_id: idea.id,
          currency: 'EUR'
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Markiere Idee als "in Projekt umgewandelt"
      const { error: ideaUpdateError } = await supabase
        .from('innovation_ideas')
        .update({ 
          status: 'converted_to_project',
          converted_project_id: project.id
        })
        .eq('id', idea.id);

      if (ideaUpdateError) throw ideaUpdateError;

      toast({
        title: "Projekt erfolgreich erstellt",
        description: `"${formData.name}" wurde als neues Projekt angelegt.`,
      });

      onSuccess?.(project.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting idea to project:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Projekts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Idee in Projekt umwandeln
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ursprungsidee Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Ursprungsidee:</h4>
            <p className="text-sm text-muted-foreground">{idea.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {idea.description}
            </p>
          </div>

          {/* Projektdetails */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Projektname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name des neuen Projekts"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaillierte Projektbeschreibung"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="z.B. Innovation, IT, Prozess"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priorität</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Startdatum
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="dueDate" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Zieldatum
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget" className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget (EUR)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="z.B. 10000"
                />
              </div>

              <div>
                <Label htmlFor="responsiblePerson" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Verantwortliche Person
                </Label>
                <Input
                  id="responsiblePerson"
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                  placeholder="Name oder ID"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Tag hinzufügen und Enter drücken"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Warnung */}
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Nach der Umwandlung wird die Idee als "in Projekt umgewandelt" markiert und kann in der Projektübersicht verwaltet werden.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.name.trim()}>
            {loading ? 'Erstelle...' : 'Projekt erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};