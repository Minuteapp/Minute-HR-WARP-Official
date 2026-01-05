import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TicketFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: TicketFilters) => void;
}

export interface TicketFilters {
  status: string[];
  priority: string[];
  category: string[];
  department: string[];
  location: string[];
  slaStatus: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

const statusOptions = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'resolved', label: 'Gelöst' },
  { value: 'escalated', label: 'Eskaliert' },
  { value: 'waiting', label: 'Wartend' },
  { value: 'closed', label: 'Geschlossen' },
];

const priorityOptions = [
  { value: 'low', label: 'Niedrig' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Hoch' },
  { value: 'critical', label: 'Kritisch' },
];

const categoryOptions = [
  { value: 'absence', label: 'Abwesenheit' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'hr', label: 'HR' },
  { value: 'it', label: 'IT' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'compliance', label: 'Compliance' },
];

const departmentOptions = [
  { value: 'vertrieb', label: 'Vertrieb' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'it', label: 'IT' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal' },
];

const locationOptions = [
  { value: 'münchen', label: 'München' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'hamburg', label: 'Hamburg' },
  { value: 'frankfurt', label: 'Frankfurt' },
  { value: 'köln', label: 'Köln' },
  { value: 'stuttgart', label: 'Stuttgart' },
];

const slaStatusOptions = [
  { value: 'ok', label: 'OK (>12h)' },
  { value: 'warning', label: 'Warnung (6-12h)' },
  { value: 'critical', label: 'Kritisch (<6h)' },
  { value: 'overdue', label: 'Überfällig (0h)' },
];

export const TicketFilterDialog: React.FC<TicketFilterDialogProps> = ({
  open,
  onOpenChange,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState<TicketFilters>({
    status: [],
    priority: [],
    category: [],
    department: [],
    location: [],
    slaStatus: [],
  });

  const handleCheckboxChange = (
    filterType: keyof Omit<TicketFilters, 'dateFrom' | 'dateTo'>,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter((v) => v !== value),
    }));
  };

  const handleReset = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      department: [],
      location: [],
      slaStatus: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const activeFilterCount = 
    filters.status.length +
    filters.priority.length +
    filters.category.length +
    filters.department.length +
    filters.location.length +
    filters.slaStatus.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Filter anwenden</DialogTitle>
          {activeFilterCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {activeFilterCount} Filter aktiv
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div>
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('status', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priorität Filter */}
          <div>
            <h3 className="font-semibold mb-3">Priorität</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={filters.priority.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('priority', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`priority-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Kategorie Filter */}
          <div>
            <h3 className="font-semibold mb-3">Kategorie</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoryOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${option.value}`}
                    checked={filters.category.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('category', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`category-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Abteilung Filter */}
          <div>
            <h3 className="font-semibold mb-3">Abteilung</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {departmentOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`department-${option.value}`}
                    checked={filters.department.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('department', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`department-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Standort Filter */}
          <div>
            <h3 className="font-semibold mb-3">Standort</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {locationOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${option.value}`}
                    checked={filters.location.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('location', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`location-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* SLA-Status Filter */}
          <div>
            <h3 className="font-semibold mb-3">SLA-Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slaStatusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sla-${option.value}`}
                    checked={filters.slaStatus.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange('slaStatus', option.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`sla-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Zeitraum */}
          <div>
            <h3 className="font-semibold mb-3">Zeitraum</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm mb-2 block">Von</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, 'dd.MM.yyyy', { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="text-sm mb-2 block">Bis</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? (
                        format(filters.dateTo, 'dd.MM.yyyy', { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Zurücksetzen
          </Button>
          <Button onClick={handleApply}>
            Filter anwenden ({activeFilterCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
