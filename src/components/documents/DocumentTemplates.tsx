import { useState } from "react";
import { Plus, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDocumentTemplates } from "@/hooks/useDocumentTemplates";
import CreateTemplateDialog from "./CreateTemplateDialog";
import UseTemplateDialog from "./UseTemplateDialog";

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  content?: string;
}

const DocumentTemplates = () => {
  const { data: templates = [], isLoading, refetch } = useDocumentTemplates();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dokumentenvorlagen</h2>
        </div>
        <p className="text-sm text-muted-foreground">Lade Vorlagen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dokumentenvorlagen</h2>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Vorlagen vorhanden</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">{template.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {template.category}
              </p>
              {template.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedTemplate(template)}
              >
                <Download className="h-4 w-4 mr-2" />
                Verwenden
              </Button>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Dialog zum Erstellen neuer Vorlagen */}
      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={() => refetch()}
      />

      {/* Dialog zum Verwenden einer Vorlage */}
      {selectedTemplate && (
        <UseTemplateDialog
          template={selectedTemplate}
          open={!!selectedTemplate}
          onOpenChange={(open) => {
            if (!open) setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentTemplates;
