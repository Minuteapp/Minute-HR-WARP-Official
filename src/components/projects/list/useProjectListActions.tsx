
import { useState, useCallback } from "react";
import { Project } from "@/types/project";
import { useProjects } from "@/hooks/projects/useProjects";

export const useProjectListActions = () => {
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | undefined>(undefined);

  const handleEdit = useCallback((project: Project) => {
    setEditProject(project);
    setShowEditDialog(true);
  }, []);

  const confirmDelete = useCallback((projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  }, []);

  const onDeleteConfirm = useCallback(async () => {
    if (projectToDelete) {
      await handleDelete(projectToDelete);
      await refreshProjects();
    }
  }, [projectToDelete, handleDelete, refreshProjects]);

  const handleArchive = useCallback(async (projectId: string) => {
    await moveToArchive(projectId);
    await refreshProjects();
  }, [moveToArchive, refreshProjects]);

  const handleTrash = useCallback(async (projectId: string) => {
    await moveToTrash(projectId);
    await refreshProjects();
  }, [moveToTrash, refreshProjects]);

  return {
    projects,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    showArchivedOrTrash,
    refreshProjects,
    editProject,
    showEditDialog,
    setShowEditDialog,
    showCreateDialog,
    setShowCreateDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    handleEdit,
    confirmDelete,
    onDeleteConfirm,
    handleArchive,
    handleTrash,
    projectToDelete
  };
};
