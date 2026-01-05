
import React from 'react';
import { ProjectModuleIntegrations } from '../modules/ProjectModuleIntegrations';

interface ProjectModulesTabProps {
  project: any;
}

export const ProjectModulesTab: React.FC<ProjectModulesTabProps> = ({ project }) => {
  return (
    <div className="space-y-6">
      <ProjectModuleIntegrations 
        projectId={project.id} 
        projectName={project.name} 
      />
    </div>
  );
};
