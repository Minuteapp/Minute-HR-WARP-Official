import { Switch } from '@/components/ui/switch';

interface NotificationRowProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggleChange: (value: boolean) => void;
}

const NotificationRow = ({
  title,
  description,
  isEnabled,
  onToggleChange
}: NotificationRowProps) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="ml-4">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggleChange}
        />
      </div>
    </div>
  );
};

export default NotificationRow;
