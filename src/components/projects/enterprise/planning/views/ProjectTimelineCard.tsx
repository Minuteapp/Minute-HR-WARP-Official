import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProjectTimeline {
  id: string;
  name: string;
  category: string;
  dateRange: string;
  milestonesCompleted: number;
  milestonesTotal: number;
  progress: number;
}

interface ProjectTimelineCardProps {
  project: ProjectTimeline;
}

const ProjectTimelineCard = ({ project }: ProjectTimelineCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h4 className="font-medium">{project.name}</h4>
            <Badge variant="outline" className="text-xs">
              {project.category}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {project.milestonesCompleted}/{project.milestonesTotal} Meilensteine
            </span>
            <span className="font-medium">{project.progress}%</span>
          </div>
        </div>
        <Progress value={project.progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{project.dateRange}</p>
      </CardContent>
    </Card>
  );
};

export default ProjectTimelineCard;
