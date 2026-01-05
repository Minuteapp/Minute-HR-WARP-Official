
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project.types";
import { toast } from "sonner";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  existingProject?: Project;
}

const NewProjectDialog = ({ open, onOpenChange, onSuccess, existingProject }: NewProjectDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    
    onOpenChange(false);
    toast.success(existingProject ? "Projekt aktualisiert" : "Projekt erfolgreich erstellt");
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!loading) {
        onOpenChange(value);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {existingProject ? "Projekt bearbeiten" : "Neues Projekt erstellen"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[calc(85vh-80px)]">
          <div className="px-6 py-4">
            <ProjectForm 
              onSubmit={handleSuccess}
              initialData={existingProject ? {
                name: existingProject.name || '',
                description: existingProject.description || '',
                status: existingProject.status || 'pending',
                priority: existingProject.priority || 'medium',
                start_date: existingProject.start_date || '',
                end_date: existingProject.end_date || '',
                startDate: existingProject.start_date || '',
                dueDate: existingProject.end_date || '',
                budget: existingProject.budget || 0,
                currency: existingProject.currency || 'EUR',
                project_type: existingProject.project_type || 'standard',
                progress: existingProject.progress || 0,
                tags: existingProject.tags || [],
                costCenter: '',
                category: '',
                responsiblePerson: '',
                team: existingProject.team_members?.map(id => ({ id, name: `User ${id}` })) || [],
                tasks: [],
                milestones: [],
                taskView: 'kanban',
                enableTimeTracking: false,
                useTaskTemplate: '',
                enableNotifications: true,
                integrateExternalTools: false,
                saveAsTemplate: false
              } : undefined}
              mode={existingProject ? 'edit' : 'create'}
              projectId={existingProject?.id}
              onLoadingChange={handleLoadingChange}
              existingProject={existingProject}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectDialog;
