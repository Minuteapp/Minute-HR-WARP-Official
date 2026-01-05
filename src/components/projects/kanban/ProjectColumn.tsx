
import { Droppable } from '@hello-pangea/dnd';
import { ProjectColumnHeader } from './ProjectColumnHeader';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { ReactNode } from 'react';
import { Project } from '@/types/project';
import { TaskCard } from '@/components/tasks/TaskCard';

interface ProjectColumnProps {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

export const ProjectColumn = ({ id, title, icon, color, projects, onProjectClick }: ProjectColumnProps) => {
  return (
    <Droppable key={id} droppableId={id}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex-shrink-0 w-80 flex flex-col rounded-lg border ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
        >
          <ProjectColumnHeader 
            title={title} 
            count={projects.length} 
            icon={icon}
            color={color}
          />
          
          <TaskColumn>
            {projects.map((project, index) => (
              <TaskCard
                key={project.id}
                task={{
                  id: project.id,
                  title: project.name,
                  description: project.description || '',
                  status: project.status as any,
                  priority: project.priority as any,
                  dueDate: project.dueDate,
                  progress: project.progress,
                  tags: [],
                  assignedTo: [],
                  completed: project.status === 'completed'
                }}
                onClick={() => onProjectClick(project.id)}
              />
            ))}
            {provided.placeholder}
          </TaskColumn>
        </div>
      )}
    </Droppable>
  );
};
