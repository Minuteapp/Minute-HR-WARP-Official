import { Check } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
}

interface MeasureMilestonesProps {
  milestones: Milestone[];
}

export const MeasureMilestones = ({ milestones }: MeasureMilestonesProps) => {
  if (milestones.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Keine Meilensteine definiert
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="flex items-center">
          <div className="flex flex-col items-center min-w-[100px]">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              milestone.completed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {milestone.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <span className={`text-xs mt-1 text-center ${
              milestone.completed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {milestone.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {milestone.date}
            </span>
          </div>
          {index < milestones.length - 1 && (
            <div className={`w-8 h-0.5 ${
              milestone.completed ? 'bg-green-300' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};
