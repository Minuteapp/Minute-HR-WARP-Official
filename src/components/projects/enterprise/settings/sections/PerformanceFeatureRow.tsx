import { Switch } from '@/components/ui/switch';

interface PerformanceFeatureRowProps {
  title: string;
  description: string;
  isActive?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

const PerformanceFeatureRow = ({
  title,
  description,
  isActive = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange
}: PerformanceFeatureRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="ml-4">
        {showToggle ? (
          <div className="flex items-center gap-2">
            <Switch
              checked={toggleValue}
              onCheckedChange={onToggleChange}
            />
            <span className="text-sm text-muted-foreground">
              {toggleValue ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
        ) : isActive ? (
          <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
            Aktiv
          </span>
        ) : (
          <span className="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full">
            Inaktiv
          </span>
        )}
      </div>
    </div>
  );
};

export default PerformanceFeatureRow;
