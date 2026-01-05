
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X, Calendar as CalendarIcon, Users, Tag } from 'lucide-react';
import { TaskFilters } from '@/types/tasks';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onResetFilters: () => void;
  teamMembers?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string }>;
}

export const TaskFilterPanel = ({
  filters,
  onFiltersChange,
  onResetFilters,
  teamMembers = [],
  tags = []
}: TaskFilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'todo', label: 'Zu erledigen' },
    { value: 'in-progress', label: 'In Bearbeitung' },
    { value: 'review', label: 'Review' },
    { value: 'blocked', label: 'Blockiert' },
    { value: 'done', label: 'Erledigt' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'Hoch' },
    { value: 'medium', label: 'Mittel' },
    { value: 'low', label: 'Niedrig' }
  ];

  const dueDateOptions = [
    { value: 'all', label: 'Alle' },
    { value: 'today', label: 'Heute' },
    { value: 'tomorrow', label: 'Morgen' },
    { value: 'this-week', label: 'Diese Woche' },
    { value: 'this-month', label: 'Dieser Monat' },
    { value: 'overdue', label: 'Überfällig' },
    { value: 'no-date', label: 'Ohne Datum' },
    { value: 'custom', label: 'Benutzerdefiniert' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriorities = checked
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const handleTagChange = (tagId: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tagId]
      : filters.tags.filter(t => t !== tagId);
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleUserChange = (userId: string, checked: boolean) => {
    const newUsers = checked
      ? [...filters.assignedTo, userId]
      : filters.assignedTo.filter(u => u !== userId);
    
    onFiltersChange({ ...filters, assignedTo: newUsers });
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | null) => {
    onFiltersChange({
      ...filters,
      dueDateCustomRange: {
        ...filters.dueDateCustomRange,
        [field]: date
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.dueDate !== 'all') count++;
    if (filters.minimumProgress > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-xs"
            >
              Zurücksetzen
            </Button>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`status-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priorität</Label>
            <div className="space-y-2">
              {priorityOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={filters.priority.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handlePriorityChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`priority-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Due Date Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Fälligkeitsdatum</Label>
            <Select value={filters.dueDate} onValueChange={(value) => 
              onFiltersChange({ ...filters, dueDate: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dueDateOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.dueDate === 'custom' && (
              <div className="space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dueDateCustomRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateCustomRange.from ? (
                          format(filters.dueDateCustomRange.from, "dd.MM.yyyy", { locale: de })
                        ) : (
                          "Von"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateCustomRange.from || undefined}
                        onSelect={(date) => handleDateRangeChange('from', date || null)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.dueDateCustomRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateCustomRange.to ? (
                          format(filters.dueDateCustomRange.to, "dd.MM.yyyy", { locale: de })
                        ) : (
                          "Bis"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateCustomRange.to || undefined}
                        onSelect={(date) => handleDateRangeChange('to', date || null)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Progress Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Mindestfortschritt: {filters.minimumProgress}%
            </Label>
            <Slider
              value={[filters.minimumProgress]}
              onValueChange={([value]) => 
                onFiltersChange({ ...filters, minimumProgress: value })
              }
              max={100}
              step={10}
            />
          </div>

          {/* Team Members Filter */}
          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Zugewiesen an
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${member.id}`}
                      checked={filters.assignedTo.includes(member.id)}
                      onCheckedChange={(checked) => 
                        handleUserChange(member.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`user-${member.id}`} className="text-sm">
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={filters.tags.includes(tag.id)}
                      onCheckedChange={(checked) => 
                        handleTagChange(tag.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
