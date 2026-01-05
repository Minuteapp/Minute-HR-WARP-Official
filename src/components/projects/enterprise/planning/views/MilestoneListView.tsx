import ProjectMilestoneGroup from './ProjectMilestoneGroup';

interface MilestoneListItem {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  dueDate: Date;
  owner: string;
  deliverables: string[];
}

interface ProjectMilestones {
  projectId: string;
  projectName: string;
  category: string;
  milestones: MilestoneListItem[];
}

interface MilestoneListViewProps {
  projectMilestones: ProjectMilestones[];
  onAddMilestone: (projectId: string) => void;
}

const MilestoneListView = ({ projectMilestones, onAddMilestone }: MilestoneListViewProps) => {
  if (projectMilestones.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        <p>Keine Projekte mit Meilensteinen vorhanden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projectMilestones.map((project) => (
        <ProjectMilestoneGroup
          key={project.projectId}
          projectName={project.projectName}
          category={project.category}
          milestones={project.milestones}
          onAddMilestone={() => onAddMilestone(project.projectId)}
        />
      ))}
    </div>
  );
};

export default MilestoneListView;
