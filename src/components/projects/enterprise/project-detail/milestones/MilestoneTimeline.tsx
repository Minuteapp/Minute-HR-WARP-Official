
import { MilestoneCard } from "./MilestoneCard";

interface MilestoneTimelineProps {
  milestones: any[];
}

export const MilestoneTimeline = ({ milestones }: MilestoneTimelineProps) => {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative pl-10">
            {/* Timeline dot */}
            <div className="absolute left-3 top-4 w-3 h-3 rounded-full bg-gray-400 border-2 border-white" />
            
            <MilestoneCard milestone={milestone} />
          </div>
        ))}
      </div>
    </div>
  );
};
