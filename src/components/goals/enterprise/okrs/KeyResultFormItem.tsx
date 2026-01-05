import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface KeyResultFormItemProps {
  index: number;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  measurementType: 'automatic' | 'manual';
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
}

export const KeyResultFormItem = ({ 
  index, 
  title, 
  targetValue, 
  currentValue, 
  unit, 
  measurementType,
  onChange,
  onRemove 
}: KeyResultFormItemProps) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <Input
            placeholder="Beschreibung"
            value={title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
          />
        </div>
        <Input
          type="number"
          placeholder="Zielwert"
          value={targetValue || ''}
          onChange={(e) => onChange(index, 'target_value', parseFloat(e.target.value) || 0)}
        />
        <Input
          placeholder="Einheit"
          value={unit}
          onChange={(e) => onChange(index, 'unit', e.target.value)}
        />
        <Select 
          value={measurementType} 
          onValueChange={(value) => onChange(index, 'measurement_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manuell</SelectItem>
            <SelectItem value="automatic">Automatisch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="button"
        variant="ghost" 
        size="icon"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};
