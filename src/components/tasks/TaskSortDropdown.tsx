import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 
  | 'dueDate-asc' 
  | 'dueDate-desc' 
  | 'priority-desc' 
  | 'title-asc' 
  | 'title-desc' 
  | 'status' 
  | 'progress-desc' 
  | 'progress-asc';

interface TaskSortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const TaskSortDropdown = ({ sortBy, onSortChange }: TaskSortDropdownProps) => {
  const sortOptions = [
    { value: 'dueDate-asc', label: 'Fälligkeitsdatum (Älteste zuerst)' },
    { value: 'dueDate-desc', label: 'Fälligkeitsdatum (Neueste zuerst)' },
    { value: 'priority-desc', label: 'Priorität (Hoch → Niedrig)' },
    { value: 'title-asc', label: 'Titel (A → Z)' },
    { value: 'title-desc', label: 'Titel (Z → A)' },
    { value: 'status', label: 'Status' },
    { value: 'progress-desc', label: 'Fortschritt (Hoch → Niedrig)' },
    { value: 'progress-asc', label: 'Fortschritt (Niedrig → Hoch)' },
  ];

  const currentLabel = sortOptions.find(o => o.value === sortBy)?.label || 'Sortieren';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sortieren
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Sortieren nach</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
