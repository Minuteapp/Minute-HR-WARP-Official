
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTemplateVersions } from '@/hooks/useTemplates';
import { History, RotateCcw, Eye } from 'lucide-react';

interface TemplateVersionDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateVersionDialog = ({ template, open, onOpenChange }: TemplateVersionDialogProps) => {
  const { data: versions = [], isLoading } = useTemplateVersions(template?.id);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Template Versionen: {template.name}
          </DialogTitle>
          <DialogDescription>
            Verlauf und Versionsverwaltung des Templates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Lade Versionen...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Versionen verfügbar
              </h3>
              <p className="text-gray-500">
                Für dieses Template sind noch keine Versionen vorhanden.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version: any) => (
                <Card key={version.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          Version {version.version_number}
                        </Badge>
                        <div>
                          <p className="font-medium">
                            {version.changes_summary || `Version ${version.version_number}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(version.created_at).toLocaleString('de-DE')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ansehen
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Wiederherstellen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
