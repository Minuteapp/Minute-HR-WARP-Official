// Compliance Hub - Arbeitszeit Filter Komponente
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkingTimeFiltersProps {
  selectedLocation: string;
  selectedViolationType: string;
  onLocationChange: (value: string) => void;
  onViolationTypeChange: (value: string) => void;
  resultCount: number;
  locations?: string[];
}

export const WorkingTimeFilters: React.FC<WorkingTimeFiltersProps> = ({
  selectedLocation,
  selectedViolationType,
  onLocationChange,
  onViolationTypeChange,
  resultCount,
  locations = []
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Standorte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedViolationType} onValueChange={onViolationTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Verstöße" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Verstöße</SelectItem>
            <SelectItem value="rest_time">Ruhezeit</SelectItem>
            <SelectItem value="max_hours">Maximalarbeitszeit</SelectItem>
            <SelectItem value="breaks">Pausen</SelectItem>
            <SelectItem value="sunday_holiday">Sonntag/Feiertag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {resultCount} Ergebnisse
      </div>
    </div>
  );
};
