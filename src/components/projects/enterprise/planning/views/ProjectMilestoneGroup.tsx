import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import MilestoneListCard from './MilestoneListCard';

interface MilestoneListItem {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  dueDate: Date;
  owner: string;
  deliverables: string[];
}

interface ProjectMilestoneGroupProps {
  projectName: string;
  category: string;
  milestones: MilestoneListItem[];
  onAddMilestone: () => void;
}

const ProjectMilestoneGroup = ({
  projectName,
  category,
  milestones,
  onAddMilestone
}: ProjectMilestoneGroupProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{projectName}</h3>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onAddMilestone}>
          <Plus className="h-4 w-4 mr-1" />
          Meilenstein
        </Button>
      </div>
      
      <div className="divide-y divide-border">
        {milestones.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Keine Meilensteine vorhanden
          </div>
        ) : (
          milestones.map((milestone) => (
            <MilestoneListCard key={milestone.id} milestone={milestone} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectMilestoneGroup;
