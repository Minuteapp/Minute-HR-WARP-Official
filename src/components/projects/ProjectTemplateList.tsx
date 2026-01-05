
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectTemplate } from "@/types/project.types";
import { useState } from "react";
import { NewTemplateDialog } from "./NewTemplateDialog";
import { EditTemplateDialog } from "./EditTemplateDialog";
import { CreateFromTemplateDialog } from "./CreateFromTemplateDialog";
import { useToast } from "@/components/ui/use-toast";

export const ProjectTemplateList = () => {
  const { toast } = useToast();
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateFromTemplateDialog, setShowCreateFromTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['project-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*, project_categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectTemplate[];
    }
  });

  const handleEdit = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowEditDialog(true);
  };

  const handleCreateFromTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowCreateFromTemplateDialog(true);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-100 rounded-lg mb-4"></div>
        <div className="h-32 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projektvorlagen</h2>
        <Button onClick={() => setShowNewTemplateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500">{template.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCreateFromTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                {template.project_categories && (
                  <Badge
                    style={{
                      backgroundColor: template.project_categories.color || '#94A3B8',
                      color: 'white'
                    }}
                  >
                    {template.project_categories.name}
                  </Badge>
                )}

                <div className="text-sm text-gray-500">
                  <div className="flex justify-between mb-1">
                    <span>Standarddauer:</span>
                    <span>{template.template_data.default_duration || '-'} Tage</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Teamgröße:</span>
                    <span>{template.template_data.default_team_size || '-'} Personen</span>
                  </div>
                  {template.template_data.required_roles && template.template_data.required_roles.length > 0 && (
                    <div className="mt-2">
                      <span className="block mb-1">Benötigte Rollen:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.template_data.required_roles.map((role: string, index: number) => (
                          <Badge key={index} variant="secondary">{role}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {templates?.length === 0 && (
          <p className="text-gray-500 col-span-full text-center py-8">
            Noch keine Projektvorlagen vorhanden
          </p>
        )}
      </div>

      <NewTemplateDialog
        open={showNewTemplateDialog}
        onOpenChange={setShowNewTemplateDialog}
      />

      <EditTemplateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        template={selectedTemplate}
      />

      <CreateFromTemplateDialog
        open={showCreateFromTemplateDialog}
        onOpenChange={setShowCreateFromTemplateDialog}
        template={selectedTemplate}
      />
    </div>
  );
}
