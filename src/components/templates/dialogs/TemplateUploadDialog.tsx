
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplate } from '@/hooks/useTemplates';
import { Upload, FileText } from 'lucide-react';
import type { CreateTemplateRequest, TemplatePlaceholder } from '@/types/templates';

interface TemplateUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: string;
}

export const TemplateUploadDialog = ({ open, onOpenChange, category }: TemplateUploadDialogProps) => {
  const [formData, setFormData] = useState<Partial<CreateTemplateRequest>>({
    name: '',
    description: '',
    category: (category as CreateTemplateRequest['category']) || 'custom',
    template_type: 'document',
    placeholders: [],
    access_level: 'all',
    languages: ['de'],
    tags: []
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const createTemplate = useCreateTemplate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name.split('.')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      return;
    }

    try {
      const templateData: CreateTemplateRequest = {
        name: formData.name,
        description: formData.description || '',
        category: formData.category,
        template_type: formData.template_type || 'document',
        placeholders: formData.placeholders || [],
        access_level: formData.access_level || 'all',
        languages: formData.languages || ['de'],
        tags: formData.tags || []
      };

      await createTemplate.mutateAsync(templateData);
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        template_type: 'document',
        placeholders: [],
        access_level: 'all',
        languages: ['de'],
        tags: []
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Fehler beim Erstellen der Vorlage:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Template hochladen
          </DialogTitle>
          <DialogDescription>
            Laden Sie eine neue Vorlage hoch oder erstellen Sie eine benutzerdefinierte Vorlage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Template Name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Kategorie</Label>
              <Select 
                value={formData.category || 'custom'} 
                onValueChange={(value: CreateTemplateRequest['category']) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">Dokumente</SelectItem>
                  <SelectItem value="goals">Ziele</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="payroll">Lohn & Gehalt</SelectItem>
                  <SelectItem value="training">Weiterbildung</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung der Vorlage..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="file">Datei auswählen</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xlsx,.pptx"
                className="flex-1"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Erstelle...' : 'Template erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
