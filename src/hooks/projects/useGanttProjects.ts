
import { useState } from 'react';
import { useProjects } from './useProjects';

export const useGanttProjects = () => {
  const { projects, isLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
  };

  return {
    projects,
    loading: isLoading,
    selectedProject,
    selectedProjectData,
    handleProjectChange
  };
};
