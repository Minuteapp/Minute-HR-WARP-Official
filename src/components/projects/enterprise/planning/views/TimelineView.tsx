import UpcomingMilestones from './UpcomingMilestones';
import ProjectTimelineCard from './ProjectTimelineCard';

interface Milestone {
  id: string;
  title: string;
  projectName: string;
  dueDate: Date;
}

interface ProjectTimeline {
  id: string;
  name: string;
  category: string;
  dateRange: string;
  milestonesCompleted: number;
  milestonesTotal: number;
  progress: number;
}

interface TimelineViewProps {
  upcomingMilestones: Milestone[];
  projectTimelines: ProjectTimeline[];
}

const TimelineView = ({ upcomingMilestones, projectTimelines }: TimelineViewProps) => {
  return (
    <div className="space-y-6">
      <UpcomingMilestones milestones={upcomingMilestones} />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Projekt-Timelines</h3>
        {projectTimelines.length === 0 ? (
          <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
            <p>Keine Projekt-Timelines vorhanden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectTimelines.map((project) => (
              <ProjectTimelineCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
