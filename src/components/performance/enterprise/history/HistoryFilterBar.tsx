import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HistoryFilterBarProps {
  employeeFilter: string;
  yearFilter: string;
  typeFilter: string;
  onEmployeeChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  employeeFilter,
  yearFilter,
  typeFilter,
  onEmployeeChange,
  onYearChange,
  onTypeChange
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={employeeFilter} onValueChange={onEmployeeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Mitarbeitende" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Mitarbeitende</SelectItem>
        </SelectContent>
      </Select>

      <Select value={yearFilter} onValueChange={onYearChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Alle Jahre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Jahre</SelectItem>
          {years.map(year => (
            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Alle Typen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="review_completed">Reviews</SelectItem>
          <SelectItem value="goal_reached">Ziele</SelectItem>
          <SelectItem value="action_completed">Maßnahmen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
