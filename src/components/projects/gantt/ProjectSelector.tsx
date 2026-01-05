
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectSelectorProps {
  projects: any[];
  selectedProject: string;
  selectedProjectData: any;
  onProjectChange: (projectId: string) => void;
  loading: boolean;
}

export const ProjectSelector = ({ 
  projects, 
  selectedProject, 
  onProjectChange, 
  loading 
}: ProjectSelectorProps) => {
  if (loading) {
    return (
      <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-md"></div>
    );
  }

  return (
    <Select value={selectedProject} onValueChange={onProjectChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Projekt auswählen" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
