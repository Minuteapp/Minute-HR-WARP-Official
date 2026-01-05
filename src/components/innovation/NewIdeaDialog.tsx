import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { innovationService } from "@/services/innovationService";

interface NewIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewIdeaDialog: React.FC<NewIdeaDialogProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    impact_score: 5,
    complexity_score: 5
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const availableTags = ["Tech", "HR", "Process", "ESG", "Cost-Saving", "Automation"];

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const ideaData = {
        title: formData.title,
        description: formData.description,
        category: 'General',
        tags: formData.tags,
        priority: formData.impact_score > 7 ? 'high' as const : formData.impact_score > 4 ? 'medium' as const : 'low' as const,
        implementation_effort: formData.complexity_score > 7 ? 'high' as const : formData.complexity_score > 4 ? 'medium' as const : 'low' as const,
        expected_impact: `Erwarteter Impact-Score: ${formData.impact_score}`,
        resources_needed: `Geschätzte Komplexität: ${formData.complexity_score}`,
        submitter_id: ''
      };

      await innovationService.createIdea(ideaData);
      
      toast({
        title: "Idee eingereicht!",
        description: "Ihre Innovation wurde erfolgreich zur Bewertung eingereicht.",
      });
      
      onOpenChange(false);
      setFormData({ title: "", description: "", tags: [], impact_score: 5, complexity_score: 5 });
      
    } catch (error) {
      console.error('Error creating idea:', error);
      toast({
        title: "Fehler",
        description: "Beim Einreichen der Idee ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Neue Innovation einreichen
          </DialogTitle>
          <DialogDescription>
            Teilen Sie Ihre innovative Idee mit dem Team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel der Innovation</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="z.B. KI-basierte Urlaubsplanung"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreiben Sie Ihre Idee ausführlich..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (formData.tags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      addTag(tag);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Eigenen Tag hinzufügen"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag(newTag);
                  }
                }}
              />
              <Button onClick={() => addTag(newTag)} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="default" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? "Wird eingereicht..." : "Idee einreichen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};