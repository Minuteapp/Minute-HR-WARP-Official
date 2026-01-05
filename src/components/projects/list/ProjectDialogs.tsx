
import NewProjectDialog from "@/components/projects/NewProjectDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Project } from "@/types/project.types";

interface ProjectDialogsProps {
  showCreateDialog: boolean;
  setShowCreateDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  projectToDelete?: string;
  onDeleteConfirm: () => void;
  refreshProjects: () => void;
  editProject: Project | null;
}

export const ProjectDialogs = ({
  showCreateDialog,
  setShowCreateDialog,
  showEditDialog,
  setShowEditDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  projectToDelete,
  onDeleteConfirm,
  refreshProjects,
  editProject
}: ProjectDialogsProps) => {
  // Convert project.types Project to format expected by NewProjectDialog
  const convertToDialogProject = (project: Project) => {
    return {
      id: project.id,
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || 0,
      currency: project.currency || 'EUR',
      project_type: project.project_type || 'standard',
      progress: project.progress || 0,
      owner_id: project.owner_id || '',
      team_members: project.team_members || [],
      tags: project.tags || [],
      custom_fields: project.custom_fields || {},
      milestone_data: project.milestone_data || [],
      dependencies: project.dependencies || [],
      visibility: project.visibility || 'internal',
      is_template: project.is_template || false,
      created_at: project.created_at,
      updated_at: project.updated_at,
      createdAt: project.createdAt
    };
  };

  return (
    <>
      {/* Neues Projekt Dialog */}
      <NewProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          refreshProjects();
        }}
      />

      {/* Projekt bearbeiten Dialog */}
      {editProject && (
        <NewProjectDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            refreshProjects();
          }}
          existingProject={convertToDialogProject(editProject)}
        />
      )}

      {/* Projekt löschen Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie dieses Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
