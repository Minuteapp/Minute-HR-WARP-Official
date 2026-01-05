
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateTemplateInstance } from '@/hooks/useDocumentTemplates';
import { FileText, FileCheck, Download, Eye, X, CheckCircle } from 'lucide-react';
import type { DocumentTemplate } from '@/types/documentTemplates';
import { toast } from 'sonner';

interface TemplatePreviewDialogProps {
  template: DocumentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplatePreviewDialog = ({
  template,
  open,
  onOpenChange
}: TemplatePreviewDialogProps) => {
  const [activeTab, setActiveTab] = useState('preview');
  const createInstance = useCreateTemplateInstance();

  if (!template) return null;

  const handleUseTemplate = async () => {
    try {
      await createInstance.mutateAsync({
        templateId: template.id,
        formData: {},
        placeholderValues: {}
      });
      
      toast.success('Vorlage wurde erfolgreich verwendet');
      onOpenChange(false);
    } catch (error) {
      toast.error('Fehler beim Verwenden der Vorlage');
      console.error('Error using template:', error);
    }
  };

  const getTemplateIcon = () => {
    return template.template_type === 'form' ? FileCheck : FileText;
  };

  const IconComponent = getTemplateIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              <span>{template.name}</span>
              <Badge variant={template.template_type === 'form' ? 'default' : 'secondary'}>
                {template.template_type === 'form' ? 'Formular' : 'Datei'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleUseTemplate}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verwenden
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vorschau
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Metadaten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
            <div className="border rounded-lg p-6 bg-gray-50 min-h-[400px]">
              {template.template_type === 'form' ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">Formular-Vorschau</h3>
                  {template.form_schema ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Dieses Formular würde hier gerendert werden basierend auf dem Schema.
                      </p>
                      <pre className="bg-white p-4 rounded border text-xs overflow-auto">
                        {JSON.stringify(template.form_schema, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-500">Kein Formular-Schema definiert</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Datei-Vorschau</p>
                  {template.file_name && (
                    <p className="text-sm text-gray-500 mt-2">
                      Datei: {template.file_name}
                    </p>
                  )}
                  {template.file_path && (
                    <Button variant="outline" className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Datei herunterladen
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Allgemeine Informationen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-900">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Typ</p>
                    <p className="text-sm text-gray-900">
                      {template.template_type === 'form' ? 'Formular' : 'Datei'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kategorie</p>
                    <p className="text-sm text-gray-900">{template.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Zugriffslevel</p>
                    <p className="text-sm text-gray-900">{template.access_level}</p>
                  </div>
                </div>
              </div>

              {template.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Beschreibung</h4>
                  <p className="text-sm text-gray-900">{template.description}</p>
                </div>
              )}

              {template.placeholders && template.placeholders.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Platzhalter</h4>
                  <div className="space-y-2">
                    {template.placeholders.map((placeholder, index) => (
                      <div key={index} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{placeholder.label}</p>
                            <p className="text-xs text-gray-500">
                              Schlüssel: {placeholder.key} | Typ: {placeholder.type}
                            </p>
                          </div>
                          {placeholder.required && (
                            <Badge variant="destructive" className="text-xs">
                              Erforderlich
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Version</p>
                  <p className="text-sm text-gray-900">{template.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Aktiv</p>
                  <p className="text-sm text-gray-900">
                    {template.is_active ? 'Ja' : 'Nein'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Signatur erforderlich</p>
                  <p className="text-sm text-gray-900">
                    {template.requires_signature ? 'Ja' : 'Nein'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Erstellt am</p>
                  <p className="text-sm text-gray-900">
                    {new Date(template.created_at).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              {template.metadata_schema && Object.keys(template.metadata_schema).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Zusätzliche Metadaten</h4>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                    {JSON.stringify(template.metadata_schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
