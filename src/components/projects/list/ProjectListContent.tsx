
import { useState, useEffect } from "react";
import { Project } from "@/types/project.types";
import { ProjectListEmpty } from "./ProjectListEmpty";
import { ProjectListFilters } from "./ProjectListFilters";
import { useProjects } from "@/hooks/projects/useProjects";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ProjectDialogs } from "./ProjectDialogs";
import { ProjectCard } from "@/components/projects/cards/ProjectCard";
import { useNavigate } from "react-router-dom";

export const ProjectListContent = () => {
  const navigate = useNavigate();
  const {
    projects,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    showArchivedOrTrash,
    handleDelete,
    moveToArchive,
    moveToTrash,
    refreshProjects
  } = useProjects();

  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Projekte nach dem Laden aktualisieren, um sicherzustellen, dass wir aktuelle Daten haben
  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const handleEdit = (project: Project) => {
    console.log("handleEdit called with project:", project);
    setEditProject(project);
    setShowEditDialog(true);
  };

  const handleView = (project: Project) => {
    console.log("handleView called with project:", project);
    // Navigate to project details page or open view dialog
    navigate(`/projects/${project.id}`);
  };

  const confirmDelete = (id: string) => {
    console.log("confirmDelete called with id:", id);
    setProjectToDelete(id);
    setShowDeleteDialog(true);
  };

  const onDeleteConfirm = async () => {
    if (!projectToDelete) {
      console.error("Kein Projekt zum Löschen");
      return;
    }
    
    try {
      console.log("Führe Löschung für Projekt-ID aus:", projectToDelete);
      await handleDelete(projectToDelete);
      setShowDeleteDialog(false);
      toast.success("Projekt wurde erfolgreich gelöscht");
    } catch (error) {
      console.error("Fehler beim Löschen des Projekts:", error);
      toast.error("Fehler beim Löschen des Projekts");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await moveToArchive(id);
      toast.success("Projekt wurde archiviert");
      await refreshProjects();
    } catch (error) {
      console.error("Fehler beim Archivieren des Projekts:", error);
      toast.error("Fehler beim Archivieren des Projekts");
    }
  };

  const handleTrash = async (id: string) => {
    try {
      await moveToTrash(id);
      toast.success("Projekt wurde in den Papierkorb verschoben");
      await refreshProjects();
    } catch (error) {
      console.error("Fehler beim Verschieben des Projekts in den Papierkorb:", error);
      toast.error("Fehler beim Verschieben des Projekts in den Papierkorb");
    }
  };

  const filteredProjects = projects;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <ProjectListFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
        <Button onClick={() => setShowCreateDialog(true)} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" />
          Neues Projekt
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <ProjectListEmpty onNewProject={() => setShowCreateDialog(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={confirmDelete}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      <ProjectDialogs
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        editProject={editProject}
        onDeleteConfirm={onDeleteConfirm}
        refreshProjects={refreshProjects}
        projectToDelete={projectToDelete || undefined}
      />
    </div>
  );
};
