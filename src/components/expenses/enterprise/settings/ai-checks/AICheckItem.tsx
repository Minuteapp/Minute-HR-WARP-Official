
import { Switch } from '@/components/ui/switch';

interface AICheckItemProps {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  onToggle: (id: string, isActive: boolean) => void;
}

const AICheckItem = ({ id, name, description, isActive, onToggle }: AICheckItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <h4 className="font-medium text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch 
        checked={isActive} 
        onCheckedChange={(checked) => onToggle(id, checked)}
      />
    </div>
  );
};

export default AICheckItem;
