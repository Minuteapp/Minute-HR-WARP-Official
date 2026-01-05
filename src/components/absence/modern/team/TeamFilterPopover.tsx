import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filter } from 'lucide-react';
import { TeamFilters } from '@/types/team.types';
import { useQuery } from '@tanstack/react-query';
import { teamAbsenceService } from '@/services/teamAbsenceService';

interface TeamFilterPopoverProps {
  activeFilters: TeamFilters;
  onFilterChange: (filters: TeamFilters) => void;
}

export const TeamFilterPopover: React.FC<TeamFilterPopoverProps> = ({
  activeFilters,
  onFilterChange
}) => {
  const [localFilters, setLocalFilters] = useState<TeamFilters>(activeFilters);
  const [open, setOpen] = useState(false);

  // Abteilungen aus DB laden
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => teamAbsenceService.getDepartments()
  });

  // Standorte aus DB laden
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => teamAbsenceService.getLocations()
  });

  const statuses = [
    { value: 'available', label: 'Verfügbar' },
    { value: 'absent', label: 'Abwesend' },
    { value: 'pending', label: 'Antrag ausstehend' }
  ];

  const handleCheckboxChange = (category: keyof TeamFilters, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: TeamFilters = { departments: [], statuses: [], locations: [] };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = 
    activeFilters.departments.length + 
    activeFilters.statuses.length + 
    activeFilters.locations.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Abteilungen */}
            <div>
              <h4 className="font-medium text-sm mb-3">Abteilungen</h4>
              <div className="space-y-2">
                {departments.map(dept => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={localFilters.departments.includes(dept)}
                      onCheckedChange={() => handleCheckboxChange('departments', dept)}
                    />
                    <label
                      htmlFor={`dept-${dept}`}
                      className="text-sm cursor-pointer"
                    >
                      {dept}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="font-medium text-sm mb-3">Status</h4>
              <div className="space-y-2">
                {statuses.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={localFilters.statuses.includes(status.value)}
                      onCheckedChange={() => handleCheckboxChange('statuses', status.value)}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Standorte */}
            <div>
              <h4 className="font-medium text-sm mb-3">Standorte</h4>
              <div className="space-y-2">
                {locations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={localFilters.locations.includes(location)}
                      onCheckedChange={() => handleCheckboxChange('locations', location)}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm cursor-pointer"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Zurücksetzen
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Anwenden
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
