import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, X, Lightbulb, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInnovationData } from '@/hooks/useInnovationData';

interface CreateIdeaDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const CreateIdeaDialog: React.FC<CreateIdeaDialogProps> = ({ 
  trigger, 
  onSuccess 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createIdea } = useInnovationData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    expected_impact: '',
    implementation_effort: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[],
    target_audience: '',
    success_metrics: '',
    resources_needed: '',
    timeline_estimate: ''
  });

  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Fehler",
        description: "Titel und Beschreibung sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await createIdea({
        title: formData.title,
        description: formData.description,
        category: formData.category || 'Allgemein',
        priority: formData.priority,
        expected_impact: formData.expected_impact,
        implementation_effort: formData.implementation_effort,
        tags: formData.tags,
        target_audience: formData.target_audience,
        success_metrics: formData.success_metrics,
        resources_needed: formData.resources_needed,
        timeline_estimate: formData.timeline_estimate,
        status: 'new'
      });

      toast({
        title: "Erfolg!",
        description: "Ihre Idee wurde erfolgreich eingereicht.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        expected_impact: '',
        implementation_effort: 'medium',
        tags: [],
        target_audience: '',
        success_metrics: '',
        resources_needed: '',
        timeline_estimate: ''
      });

      setOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen der Idee ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      <Plus className="h-4 w-4 mr-2" />
      Neue Idee
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Neue Innovation einreichen
          </DialogTitle>
          <DialogDescription>
            Teilen Sie Ihre innovative Idee mit dem Team und bringen Sie das Unternehmen voran.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grundinformationen */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Grundinformationen
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titel*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. KI-gestützter Kundenservice"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung*</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreiben Sie Ihre Idee ausführlich..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technologie">Technologie</SelectItem>
                    <SelectItem value="Prozesse">Prozesse</SelectItem>
                    <SelectItem value="Produkte">Produkte</SelectItem>
                    <SelectItem value="Kundenservice">Kundenservice</SelectItem>
                    <SelectItem value="Nachhaltigkeit">Nachhaltigkeit</SelectItem>
                    <SelectItem value="HR">Personal</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Allgemein">Allgemein</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorität</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
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
          </div>

          {/* Impact & Aufwand */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Impact & Aufwand
            </h3>

            <div className="space-y-2">
              <Label htmlFor="expected_impact">Erwarteter Impact</Label>
              <Textarea
                id="expected_impact"
                value={formData.expected_impact}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_impact: e.target.value }))}
                placeholder="Welchen positiven Einfluss wird diese Idee haben?"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="implementation_effort">Implementierungsaufwand</Label>
              <Select value={formData.implementation_effort} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, implementation_effort: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig (1-3 Monate)</SelectItem>
                  <SelectItem value="medium">Mittel (3-6 Monate)</SelectItem>
                  <SelectItem value="high">Hoch (6+ Monate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resources_needed">Benötigte Ressourcen</Label>
                <Input
                  id="resources_needed"
                  value={formData.resources_needed}
                  onChange={(e) => setFormData(prev => ({ ...prev, resources_needed: e.target.value }))}
                  placeholder="Budget, Personal, Technologie..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline_estimate">Zeitschätzung</Label>
                <Input
                  id="timeline_estimate"
                  value={formData.timeline_estimate}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline_estimate: e.target.value }))}
                  placeholder="z.B. Q2 2024"
                />
              </div>
            </div>
          </div>

          {/* Zusätzliche Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target_audience">Zielgruppe</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="Wer profitiert von dieser Idee?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success_metrics">Erfolgsmessung</Label>
              <Textarea
                id="success_metrics"
                value={formData.success_metrics}
                onChange={(e) => setFormData(prev => ({ ...prev, success_metrics: e.target.value }))}
                placeholder="Wie messen wir den Erfolg dieser Idee?"
                className="min-h-[80px]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Tag hinzufügen..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Wird erstellt...' : 'Idee einreichen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};