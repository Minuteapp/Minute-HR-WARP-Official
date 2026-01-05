
import React from 'react';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ProjectTasksTab } from './ProjectTasksTab';
import { ProjectTeamTab } from './ProjectTeamTab';
import { ProjectDocumentsTab } from './ProjectDocumentsTab';
import { ProjectMilestonesTab } from './ProjectMilestonesTab';
import { ProjectModulesTab } from './ProjectModulesTab';
import { ProjectDetailsTab } from './ProjectDetailsTab';
import { SiteMapTab } from './visual-tools/SiteMapTab';
import { UserFlowTab } from './visual-tools/UserFlowTab';
import { MindMapTab } from './visual-tools/MindMapTab';

interface ProjectTabContentProps {
  project: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: any[];
  teamMembers: any[];
  milestones: any[];
}

export const ProjectTabContent: React.FC<ProjectTabContentProps> = ({
  project,
  activeTab,
  setActiveTab,
  documents,
  teamMembers,
  milestones
}) => {
  switch (activeTab) {
    case 'overview':
      return <ProjectOverviewTab project={project} />;
    case 'tasks':
      return <ProjectTasksTab project={project} />;
    case 'team':
      return <ProjectTeamTab project={project} teamMembers={teamMembers} />;
    case 'documents':
      return <ProjectDocumentsTab project={project} documents={documents} />;
    case 'milestones':
      return <ProjectMilestonesTab project={project} milestones={milestones} />;
    case 'modules':
      return <ProjectModulesTab project={project} />;
    case 'details':
      return <ProjectDetailsTab project={project} setActiveTab={setActiveTab} />;
    case 'sitemap':
      return <SiteMapTab project={project} />;
    case 'userflow':
      return <UserFlowTab project={project} />;
    case 'mindmap':
      return <MindMapTab project={project} />;
    default:
      return <ProjectOverviewTab project={project} />;
  }
};
