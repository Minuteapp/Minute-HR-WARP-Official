import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalFilterSidebarProps {
  filters: {
    types: string[];
    priorities: string[];
    departments: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export const ApprovalFilterSidebar = ({ filters, onFiltersChange }: ApprovalFilterSidebarProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);

  // Lade Abteilungen dynamisch aus der Datenbank
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-filter-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('employees')
        .select('department')
        .eq('status', 'active')
        .not('department', 'is', null);
      return [...new Set(data?.map(e => e.department).filter(Boolean))];
    }
  });

  const absenceTypes = [
    { value: 'vacation', label: 'Urlaub' },
    { value: 'sick_leave', label: 'Krankheit' },
    { value: 'business_trip', label: 'Dienstreise' },
    { value: 'other', label: 'Sonderurlaub' }
  ];

  const priorities = [
    { value: 'high', label: 'Hohe Priorität' },
    { value: 'medium', label: 'Mittlere Priorität' },
    { value: 'low', label: 'Niedrige Priorität' }
  ];

  const handleTypeToggle = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const handlePriorityToggle = (priority: string) => {
    setLocalFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }));
  };

  const handleDepartmentToggle = (department: string) => {
    setLocalFilters(prev => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter(d => d !== department)
        : [...prev.departments, department]
    }));
  };

  const handleReset = () => {
    const resetFilters = { types: [], priorities: [], departments: [] };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const activeFiltersCount = 
    localFilters.types.length + 
    localFilters.priorities.length + 
    localFilters.departments.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Abwesenheitsart</h4>
              <div className="space-y-2">
                {absenceTypes.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={localFilters.types.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    />
                    <Label htmlFor={`type-${type.value}`} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Priorität</h4>
              <div className="space-y-2">
                {priorities.map(priority => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={localFilters.priorities.includes(priority.value)}
                      onCheckedChange={() => handlePriorityToggle(priority.value)}
                    />
                    <Label htmlFor={`priority-${priority.value}`} className="cursor-pointer">
                      {priority.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Abteilungen</h4>
              <div className="space-y-2">
                {departments.map(department => (
                  <div key={department} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${department}`}
                      checked={localFilters.departments.includes(department)}
                      onCheckedChange={() => handleDepartmentToggle(department)}
                    />
                    <Label htmlFor={`dept-${department}`} className="cursor-pointer">
                      {department}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Zurücksetzen
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Anwenden
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
