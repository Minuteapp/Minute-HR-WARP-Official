
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download, Copy, Star } from 'lucide-react';

interface TemplatePreviewDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplatePreviewDialog = ({ template, open, onOpenChange }: TemplatePreviewDialogProps) => {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Template Vorschau: {template.name}
          </DialogTitle>
          <DialogDescription>
            Detailansicht und Vorschau des Templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="font-medium">{template.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Kategorie</label>
                  <p>{template.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Typ</label>
                  <p>{template.template_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Version</label>
                  <p>{template.version}</p>
                </div>
              </div>
              
              {template.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Beschreibung</label>
                  <p className="text-gray-700">{template.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {template.usage_count}× verwendet
                </Badge>
                {template.rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {template.rating}
                  </Badge>
                )}
                {template.is_system_template && (
                  <Badge variant="outline">System Template</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Inhalt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                {template.file_path ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-gray-600">Dateivorschau</p>
                    <p className="text-sm text-gray-500">{template.file_name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium">Template Struktur:</h4>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(template.content || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Placeholders */}
          {template.placeholders && template.placeholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verfügbare Platzhalter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.placeholders.map((placeholder: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                          {`{${placeholder.key}}`}
                        </span>
                        <span className="ml-2 text-sm">{placeholder.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {placeholder.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Herunterladen
            </Button>
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </Button>
            <Button>
              Template verwenden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
