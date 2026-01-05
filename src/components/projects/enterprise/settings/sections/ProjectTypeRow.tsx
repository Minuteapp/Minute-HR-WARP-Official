import { Switch } from '@/components/ui/switch';

interface ProjectTypeRowProps {
  name: string;
  color: string;
  projectCount: number;
  isActive: boolean;
  onToggleChange: (value: boolean) => void;
  onEdit: () => void;
}

const ProjectTypeRow = ({
  name,
  color,
  projectCount,
  isActive,
  onToggleChange,
  onEdit
}: ProjectTypeRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="font-medium">{name}</span>
        <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full border border-border">
          {projectCount} Projekte
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={onToggleChange}
          />
          <span className="text-sm text-muted-foreground w-12">
            {isActive ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>
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

export default ProjectTypeRow;
