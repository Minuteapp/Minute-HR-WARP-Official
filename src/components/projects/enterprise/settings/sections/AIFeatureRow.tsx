import { Switch } from '@/components/ui/switch';

interface AIFeatureRowProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggleChange: (value: boolean) => void;
}

const AIFeatureRow = ({
  title,
  description,
  isEnabled,
  onToggleChange
}: AIFeatureRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggleChange}
        />
        <span className="text-sm text-muted-foreground w-8">
          {isEnabled ? 'An' : 'Aus'}
        </span>
      </div>
    </div>
  );
};

export default AIFeatureRow;
