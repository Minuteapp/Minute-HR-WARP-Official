
import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useProjects } from '@/hooks/projects/useProjects';
import { Button } from '@/components/ui/button';
import { KanbanColumn } from './kanban/KanbanColumn';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectKanbanBoard = () => {
  const { projects, isLoading, updateProjectStatus } = useProjects();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Konvertiere projects zu einem kompatiblen Format
  const convertedProjects = projects.map(project => ({
    ...project,
    createdAt: project.created_at,
    dueDate: project.end_date,
    startDate: project.start_date,
    updatedAt: project.updated_at
  }));

  const todoProjects = convertedProjects.filter(project => project.status === 'pending');
  const inProgressProjects = convertedProjects.filter(project => project.status === 'active');
  const inReviewProjects = convertedProjects.filter(project => project.status === 'completed');
  const completedProjects = convertedProjects.filter(project => project.status === 'archived');

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    let newStatus: string;
    
    switch (destination.droppableId) {
      case 'todo':
        newStatus = 'pending';
        break;
      case 'in_progress':
        newStatus = 'active';
        break;
      case 'review':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'archived';
        break;
      default:
        newStatus = 'pending';
    }
    
    try {
      setError(null);
      await updateProjectStatus(draggableId, newStatus);
      toast.success('Projektstatus erfolgreich aktualisiert');
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Projektstatus:', err);
      setError('Fehler beim Aktualisieren des Projektstatus');
      toast.error('Fehler beim Aktualisieren des Projektstatus');
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Projekte werden geladen...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Keine Projekte gefunden</h2>
            <p className="text-gray-500 mt-2">Erstellen Sie Ihr erstes Projekt, um zu beginnen.</p>
            <Button className="mt-4" onClick={() => navigate('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Projekt
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          Kanban Board
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <KanbanColumn
                id="todo"
                title="To-Do"
                color="bg-blue-500"
                projects={todoProjects}
                onProjectClick={handleProjectClick}
              />
              
              <KanbanColumn
                id="in_progress"
                title="In Bearbeitung"
                color="bg-amber-500"
                projects={inProgressProjects}
                onProjectClick={handleProjectClick}
              />
              
              <KanbanColumn
                id="review"
                title="Review"
                color="bg-purple-500"
                projects={inReviewProjects}
                onProjectClick={handleProjectClick}
              />
              
              <KanbanColumn
                id="completed"
                title="Abgeschlossen"
                color="bg-green-500"
                projects={completedProjects}
                onProjectClick={handleProjectClick}
              />
            </div>
          </DragDropContext>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectKanbanBoard;
