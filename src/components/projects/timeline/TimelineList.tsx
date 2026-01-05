
import { Project } from "@/types/project";
import { TimelineProject } from "./TimelineProject";

interface TimelineListProps {
  projects: Project[];
  today: Date;
}

export const TimelineList = ({ projects, today }: TimelineListProps) => {
  // Sortierung der Projekte nach Fälligkeitsdatum
  const sortedProjects = [...projects].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="space-y-4 mt-4">
      {sortedProjects.map((project) => (
        <TimelineProject 
          key={project.id} 
          project={project} 
          today={today}
        />
      ))}
    </div>
  );
};
