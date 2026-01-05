
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IdeaSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IdeaSubmissionDialog = ({ open, onOpenChange }: IdeaSubmissionDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    expectedBenefit: '',
    implementation: '',
    resources: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const categories = [
    "Zeitmanagement",
    "HR-Prozesse",
    "Integration",
    "Kommunikation",
    "Automatisierung",
    "Nachhaltigkeit",
    "Mitarbeitererfahrung",
    "Produktivität",
    "Sicherheit",
    "Reporting"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    console.log('Submitting idea:', { ...formData, tags });
    
    toast({
      title: "Idee eingereicht",
      description: "Ihre Idee wurde erfolgreich eingereicht und wird geprüft."
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      expectedBenefit: '',
      implementation: '',
      resources: ''
    });
    setTags([]);
    onOpenChange(false);
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Idee einreichen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Kurzer, prägnanter Titel für Ihre Idee"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detaillierte Beschreibung Ihrer Idee..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag hinzufügen"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="expectedBenefit">Erwarteter Nutzen</Label>
              <Textarea
                id="expectedBenefit"
                value={formData.expectedBenefit}
                onChange={(e) => setFormData({ ...formData, expectedBenefit: e.target.value })}
                placeholder="Welche Vorteile erwarten Sie von dieser Idee?"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="implementation">Umsetzungsvorschlag</Label>
              <Textarea
                id="implementation"
                value={formData.implementation}
                onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
                placeholder="Wie könnte diese Idee umgesetzt werden?"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="resources">Benötigte Ressourcen</Label>
              <Textarea
                id="resources"
                value={formData.resources}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                placeholder="Welche Ressourcen wären für die Umsetzung nötig?"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              Idee einreichen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaSubmissionDialog;
