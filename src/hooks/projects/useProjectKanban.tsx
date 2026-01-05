
import { useState, useEffect, useCallback } from 'react';
import { useProjects } from '@/hooks/projects/useProjects';
import { Project } from '@/types/project';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useProjectKanban = () => {
  const { projects, refreshProjects, updateProjectStatus, handleDelete } = useProjects();
  const [loading, setLoading] = useState(true);
  const [boardProjects, setBoardProjects] = useState<Project[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (projects) {
      console.log("Setting board projects:", projects);
      const filteredProjects = projects.filter(
        project => project.status !== 'completed' && project.status !== 'archived'
      );
      setBoardProjects(filteredProjects);
      setLoading(false);
    }
  }, [projects]);

  const getProjectsByStatus = useCallback((status: string) => {
    return boardProjects.filter(project => {
      if (status === 'in_progress') {
        return project.status === 'active';
      }
      return project.status === status;
    });
  }, [boardProjects]);

  const onDragEnd = useCallback(async (result: any) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;

    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) {
      return;
    }

    console.log(`Drag end: Moving ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);
    
    // Validieren Sie den Zielstatus
    let targetStatus = destination.droppableId;
    
    // Status-Mapping für die Datenbank
    if (targetStatus === 'planned') targetStatus = 'pending';
    if (targetStatus === 'in_progress') targetStatus = 'active';
    if (targetStatus === 'blocked') targetStatus = 'active';
    
    const validStatuses = ['pending', 'active', 'completed'];
    if (!validStatuses.includes(targetStatus)) {
      console.error("Ungültiger Zielstatus:", targetStatus);
      toast.error(`Ungültiger Status: ${targetStatus}`);
      return;
    }
    
    // Aktualisiere den lokalen Zustand sofort für bessere Benutzererfahrung
    setBoardProjects(prev => 
      prev.map(project => 
        project.id === draggableId 
          ? {...project, status: targetStatus as any} 
          : project
      )
    );
    
    // Backend-Aktualisierung in einem try/catch-Block für Fehlerbehandlung
    try {
      setLoading(true);
      // Korrigiert: Wir speichern das Ergebnis nicht in einer Variable, 
      // da wir es nicht als Wahrheitswert testen
      await updateProjectStatus(draggableId, targetStatus);
      // Erfolgsmeldung immer anzeigen
      toast.success('Projektstatus wurde aktualisiert');
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Fehler beim Aktualisieren des Projektstatus');
      // Zurücksetzen des lokalen Zustands im Fehlerfall
      await refreshProjects();
    } finally {
      setLoading(false);
    }
  }, [updateProjectStatus, refreshProjects]);

  const handleProjectClick = useCallback((projectId: string) => {
    if (projectId) {
      console.log("Navigating to project:", projectId);
      navigate(`/projects/${projectId}`);
    }
  }, [navigate]);

  const confirmDelete = useCallback((projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  }, []);

  const onDeleteConfirm = useCallback(async () => {
    if (!projectToDelete) return;
    
    try {
      // Korrigiert: Wir speichern das Ergebnis nicht in einer Variable,
      // da wir es nicht als Wahrheitswert testen
      await handleDelete(projectToDelete);
      // Wir aktualisieren den Zustand und zeigen eine Erfolgsmeldung
      setBoardProjects(prev => prev.filter(project => project.id !== projectToDelete));
      toast.success('Projekt wurde erfolgreich gelöscht');
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Fehler beim Löschen des Projekts');
    }
  }, [projectToDelete, handleDelete]);

  return {
    loading,
    boardProjects,
    getProjectsByStatus,
    onDragEnd,
    handleProjectClick,
    confirmDelete,
    onDeleteConfirm,
    showDeleteDialog,
    setShowDeleteDialog,
    projectToDelete
  };
};
