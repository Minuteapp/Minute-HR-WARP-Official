import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, Check } from 'lucide-react';

export interface TaskFilters {
  status: string[];
  priority: string[];
  project: string[];
}

interface TaskFilterDropdownProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export const TaskFilterDropdown = ({ filters, onFiltersChange }: TaskFilterDropdownProps) => {
  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'todo', label: 'Offen' },
    { value: 'in-progress', label: 'In Bearbeitung' },
    { value: 'done', label: 'Abgeschlossen' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'Alle Prioritäten' },
    { value: 'high', label: 'Hoch' },
    { value: 'medium', label: 'Mittel' },
    { value: 'low', label: 'Niedrig' },
  ];

  const projectOptions = [
    { value: 'all', label: 'Alle Projekte' },
    { value: 'recruiting', label: 'Recruiting' },
    { value: 'performance', label: 'Performance' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'payroll', label: 'Lohn & Gehalt' },
    { value: 'culture', label: 'Team & Kultur' },
  ];

  const toggleFilter = (type: keyof TaskFilters, value: string) => {
    const current = filters[type];
    
    if (value === 'all') {
      onFiltersChange({ ...filters, [type]: ['all'] });
    } else {
      const withoutAll = current.filter(v => v !== 'all');
      const newValues = withoutAll.includes(value)
        ? withoutAll.filter(v => v !== value)
        : [...withoutAll, value];
      
      onFiltersChange({
        ...filters,
        [type]: newValues.length === 0 ? ['all'] : newValues
      });
    }
  };

  const isChecked = (type: keyof TaskFilters, value: string) => {
    if (value === 'all') return filters[type].includes('all');
    return filters[type].includes(value);
  };

  const activeFiltersCount = 
    (filters.status.includes('all') ? 0 : filters.status.length) +
    (filters.priority.includes('all') ? 0 : filters.priority.length) +
    (filters.project.includes('all') ? 0 : filters.project.length);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Nach Status filtern</DropdownMenuLabel>
        {statusOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={isChecked('status', option.value)}
            onCheckedChange={() => toggleFilter('status', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Nach Priorität filtern</DropdownMenuLabel>
        {priorityOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={isChecked('priority', option.value)}
            onCheckedChange={() => toggleFilter('priority', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Nach Projekt filtern</DropdownMenuLabel>
        {projectOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={isChecked('project', option.value)}
            onCheckedChange={() => toggleFilter('project', option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
