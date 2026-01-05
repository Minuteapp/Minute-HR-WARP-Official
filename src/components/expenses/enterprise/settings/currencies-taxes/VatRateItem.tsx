
import { Switch } from '@/components/ui/switch';

interface VatRateItemProps {
  id: string;
  name: string;
  rate: string;
  isActive: boolean;
  onToggle: (id: string, isActive: boolean) => void;
}

const VatRateItem = ({ id, name, rate, isActive, onToggle }: VatRateItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <h4 className="font-medium text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground">{rate}</p>
      </div>
      <Switch 
        checked={isActive} 
        onCheckedChange={(checked) => onToggle(id, checked)}
      />
    </div>
  );
};

export default VatRateItem;
