
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

export const KanbanColumn = ({ id, title, color, projects, onProjectClick }: KanbanColumnProps) => {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col rounded-lg border bg-white shadow-sm">
      <div className={`flex items-center justify-between p-3 border-b bg-white sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
            {projects.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            className={`flex-1 p-3 overflow-y-auto min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => onProjectClick(project.id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-center text-sm text-gray-500 hover:bg-gray-50">
          <Plus className="h-4 w-4 mr-1" /> Add new
        </Button>
      </div>
    </div>
  );
};
