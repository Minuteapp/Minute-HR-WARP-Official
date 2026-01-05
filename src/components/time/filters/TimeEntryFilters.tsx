import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { HistoryFilters } from "@/types/time-tracking.types";
import { cn } from "@/lib/utils";

interface TimeEntryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  availableProjects: string[];
  onClose: () => void;
}

export const TimeEntryFilters = ({
  filters,
  onFiltersChange,
  availableProjects,
  onClose
}: TimeEntryFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<HistoryFilters>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: HistoryFilters = {
      startDate: undefined,
      endDate: undefined,
      projects: [],
      locations: [],
      status: []
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const handleQuickFilter = (period: string) => {
    const today = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (period) {
      case 'today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        break;
    }

    setLocalFilters({ ...localFilters, startDate, endDate });
  };

  const toggleStatus = (status: 'active' | 'pending' | 'completed' | 'cancelled') => {
    const currentStatus = localFilters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    setLocalFilters({ ...localFilters, status: newStatus });
  };

  const toggleLocation = (location: string) => {
    const currentLocations = localFilters.locations || [];
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter(l => l !== location)
      : [...currentLocations, location];
    setLocalFilters({ ...localFilters, locations: newLocations });
  };

  const toggleProject = (project: string) => {
    const currentProjects = localFilters.projects || [];
    const newProjects = currentProjects.includes(project)
      ? currentProjects.filter(p => p !== project)
      : [...currentProjects, project];
    setLocalFilters({ ...localFilters, projects: newProjects });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filter</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Schnellfilter */}
      <div className="space-y-2">
        <Label>Zeitraum</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter('today')}>
            Heute
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter('thisWeek')}>
            Diese Woche
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter('thisMonth')}>
            Dieser Monat
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickFilter('lastMonth')}>
            Letzter Monat
          </Button>
        </div>
      </div>

      {/* Datum-Bereich */}
      <div className="space-y-3">
        <Label>Datum-Bereich</Label>
        <div className="grid gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !localFilters.startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.startDate ? format(localFilters.startDate, "dd.MM.yyyy", { locale: de }) : "Von"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.startDate}
                onSelect={(date) => setLocalFilters({ ...localFilters, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("justify-start text-left font-normal", !localFilters.endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.endDate ? format(localFilters.endDate, "dd.MM.yyyy", { locale: de }) : "Bis"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.endDate}
                onSelect={(date) => setLocalFilters({ ...localFilters, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <Label>Status</Label>
        <div className="space-y-2">
          {[
            { value: 'active', label: 'Aktiv' },
            { value: 'pending', label: 'Pausiert' },
            { value: 'completed', label: 'Genehmigt' },
            { value: 'cancelled', label: 'Abgebrochen' }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${value}`}
                checked={localFilters.status?.includes(value as any) || false}
                onCheckedChange={() => toggleStatus(value as any)}
              />
              <Label htmlFor={`status-${value}`} className="font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Arbeitsort */}
      <div className="space-y-3">
        <Label>Arbeitsort</Label>
        <div className="space-y-2">
          {[
            { value: 'office', label: 'Im Büro' },
            { value: 'home', label: 'Home Office' },
            { value: 'mobile', label: 'Unterwegs' }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${value}`}
                checked={localFilters.locations?.includes(value) || false}
                onCheckedChange={() => toggleLocation(value)}
              />
              <Label htmlFor={`location-${value}`} className="font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Projekte */}
      {availableProjects.length > 0 && (
        <div className="space-y-3">
          <Label>Projekte</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableProjects.map((project) => (
              <div key={project} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-${project}`}
                  checked={localFilters.projects?.includes(project) || false}
                  onCheckedChange={() => toggleProject(project)}
                />
                <Label htmlFor={`project-${project}`} className="font-normal cursor-pointer">
                  {project}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aktionen */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" className="flex-1" onClick={handleReset}>
          Zurücksetzen
        </Button>
        <Button className="flex-1" onClick={handleApply}>
          Anwenden
        </Button>
      </div>
    </div>
  );
};
