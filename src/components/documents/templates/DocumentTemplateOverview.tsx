
import { useState } from 'react';
import { useDocumentTemplates, useTemplateCategories } from '@/hooks/useDocumentTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Filter, Eye, FileCheck } from 'lucide-react';
import { CreateTemplateDialog } from './CreateTemplateDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import type { DocumentTemplate } from '@/types/documentTemplates';

export const DocumentTemplateOverview = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const { data: categories = [] } = useTemplateCategories();
  const { data: templates = [], isLoading } = useDocumentTemplates(
    selectedCategory === 'all' ? undefined : selectedCategory
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviewTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const getTemplateIcon = (templateType: string) => {
    return templateType === 'form' ? FileCheck : FileText;
  };

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-8">
          <p>Laden der Dokumentvorlagen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dokumentvorlagen</h1>
          <p className="text-sm text-gray-500">
            Erstellen und verwalten Sie Vorlagen für häufig verwendete Dokumente
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Vorlagen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.category_key} value={category.category_key}>
              {category.display_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Vorlagen gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? 'Keine Vorlagen entsprechen Ihrer Suche.'
                  : 'Erstellen Sie Ihre erste Dokumentvorlage.'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Neue Vorlage erstellen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const IconComponent = getTemplateIcon(template.template_type);
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        <Badge variant={template.template_type === 'form' ? 'default' : 'secondary'}>
                          {template.template_type === 'form' ? 'Formular' : 'Datei'}
                        </Badge>
                      </div>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {categories.find(cat => cat.category_key === template.category)?.display_name || template.category}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Vorschau
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {selectedTemplate && (
        <TemplatePreviewDialog
          template={selectedTemplate}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
        />
      )}
    </div>
  );
};
