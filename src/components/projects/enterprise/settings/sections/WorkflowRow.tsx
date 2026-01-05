import { Switch } from '@/components/ui/switch';
import { GitBranch } from 'lucide-react';

interface WorkflowRowProps {
  name: string;
  stepCount: number;
  phases: string[];
  isActive: boolean;
  onToggleChange: (value: boolean) => void;
  onEdit: () => void;
}

const WorkflowRow = ({
  name,
  stepCount,
  phases,
  isActive,
  onToggleChange,
  onEdit
}: WorkflowRowProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-lg mt-0.5">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full border border-border">
              {stepCount} Schritte
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {phases.join(' → ')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Switch
          checked={isActive}
          onCheckedChange={onToggleChange}
        />
        <button
          onClick={onEdit}
          className="text-sm text-primary hover:underline"
        >
          Bearbeiten
        </button>
      </div>
    </div>
  );
};

export default WorkflowRow;
