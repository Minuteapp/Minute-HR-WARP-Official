
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';

interface CategoryItemProps {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CategoryItem = ({ 
  id, 
  name, 
  description, 
  isActive, 
  onToggle, 
  onEdit, 
  onDelete 
}: CategoryItemProps) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <h4 className="font-medium text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <Switch 
          checked={isActive} 
          onCheckedChange={(checked) => onToggle(id, checked)}
        />
        <button 
          onClick={() => onEdit(id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoryItem;
