
import { Project } from "@/types/project.types";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  showArchivedOrTrash: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
}

export const ProjectGrid = ({
  projects,
  showArchivedOrTrash,
  onEdit,
  onDelete,
  onArchive,
  onTrash
}: ProjectGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id}
          project={project}
          onEdit={() => onEdit(project)}
          onDelete={() => onDelete(project.id)}
          onArchive={() => onArchive(project.id)}
          onTrash={() => onTrash(project.id)}
          showArchivedOrTrash={showArchivedOrTrash}
        />
      ))}
    </div>
  );
};
