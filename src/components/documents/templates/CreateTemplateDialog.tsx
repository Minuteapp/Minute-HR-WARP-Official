
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTemplate, useTemplateCategories } from '@/hooks/useDocumentTemplates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { DocumentTemplate, TemplatePlaceholder } from '@/types/documentTemplates';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateDialog = ({ open, onOpenChange }: CreateTemplateDialogProps) => {
  const [templateType, setTemplateType] = useState<'file' | 'form'>('file');
  const [placeholders, setPlaceholders] = useState<TemplatePlaceholder[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { data: categories = [] } = useTemplateCategories();
  const createTemplate = useCreateTemplate();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<DocumentTemplate>>();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue('file_name', file.name);
      setValue('mime_type', file.type);
    }
  };

  const addPlaceholder = () => {
    setPlaceholders([...placeholders, {
      key: '',
      label: '',
      type: 'text',
      required: false
    }]);
  };

  const removePlaceholder = (index: number) => {
    setPlaceholders(placeholders.filter((_, i) => i !== index));
  };

  const updatePlaceholder = (index: number, field: keyof TemplatePlaceholder, value: any) => {
    const updated = [...placeholders];
    updated[index] = { ...updated[index], [field]: value };
    setPlaceholders(updated);
  };

  const onSubmit = async (data: Partial<DocumentTemplate>) => {
    try {
      const templateData: Partial<DocumentTemplate> = {
        ...data,
        template_type: templateType,
        placeholders: placeholders,
        is_active: true
      };

      if (templateType === 'file' && uploadedFile) {
        // In einer realen Implementierung würde hier die Datei hochgeladen
        templateData.file_path = `templates/${Date.now()}_${uploadedFile.name}`;
      }

      await createTemplate.mutateAsync(templateData);
      toast.success('Vorlage wurde erfolgreich erstellt');
      
      // Reset form
      reset();
      setPlaceholders([]);
      setUploadedFile(null);
      setTemplateType('file');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Fehler beim Erstellen der Vorlage');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Dokumentvorlage erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={templateType} onValueChange={(value) => setTemplateType(value as 'file' | 'form')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Datei-Vorlage</TabsTrigger>
              <TabsTrigger value="form">Formular-Vorlage</TabsTrigger>
            </TabsList>

            <div className="space-y-4 mt-4">
              {/* Grundlegende Informationen */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Name ist erforderlich' })}
                    placeholder="Vorlagenname"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.category_key} value={category.category_key}>
                          {category.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">Kategorie ist erforderlich</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Beschreibung der Vorlage"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="access_level">Zugriffsberechtigung</Label>
                  <Select onValueChange={(value) => setValue('access_level', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zugriff wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Benutzer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR-Team</SelectItem>
                      <SelectItem value="admin">Nur Administratoren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="requires_signature"
                    onCheckedChange={(checked) => setValue('requires_signature', checked)}
                  />
                  <Label htmlFor="requires_signature">Signatur erforderlich</Label>
                </div>
              </div>
            </div>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label>Template-Datei hochladen *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".docx,.pdf,.html"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Klicken Sie hier, um eine Datei hochzuladen
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Unterstützte Formate: DOCX, PDF, HTML
                    </p>
                  </label>
                  {uploadedFile && (
                    <div className="mt-2">
                      <Badge variant="secondary">{uploadedFile.name}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Platzhalter für Datei-Templates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Platzhalter</Label>
                  <Button type="button" size="sm" onClick={addPlaceholder}>
                    <Plus className="h-4 w-4 mr-1" />
                    Hinzufügen
                  </Button>
                </div>
                <div className="space-y-2">
                  {placeholders.map((placeholder, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded">
                      <Input
                        placeholder="Schlüssel (z.B. {{name}})"
                        value={placeholder.key}
                        onChange={(e) => updatePlaceholder(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Bezeichnung"
                        value={placeholder.label}
                        onChange={(e) => updatePlaceholder(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        value={placeholder.type}
                        onValueChange={(value) => updatePlaceholder(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Zahl</SelectItem>
                          <SelectItem value="date">Datum</SelectItem>
                          <SelectItem value="select">Auswahl</SelectItem>
                          <SelectItem value="boolean">Ja/Nein</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removePlaceholder(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <p>Formular-Editor wird in einer zukünftigen Version implementiert</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? 'Erstelle...' : 'Vorlage erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
