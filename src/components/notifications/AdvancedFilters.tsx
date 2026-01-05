import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface FilterState {
  priority: string;
  source: string;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onlyUnread: boolean;
  onlyImportant: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function AdvancedFilters({ filters, onFiltersChange, onReset }: AdvancedFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-50/50 border border-gray-200 rounded-lg p-4 mb-6 space-y-4">
      <h3 className="text-sm font-medium">Erweiterte Filter</h3>
      
      {/* Filter Grid - 4 Spalten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Priorität */}
        <div className="space-y-2">
          <Label>Priorität</Label>
          <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Alle Prioritäten" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Alle Prioritäten</SelectItem>
              <SelectItem value="critical">Kritisch</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quelle */}
        <div className="space-y-2">
          <Label>Quelle</Label>
          <Select value={filters.source} onValueChange={(value) => updateFilter('source', value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Alle Quellen" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">Alle Quellen</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="absence">Abwesenheitsmanagement</SelectItem>
              <SelectItem value="tasks">Aufgaben</SelectItem>
              <SelectItem value="calendar">Kalender</SelectItem>
              <SelectItem value="ai-insights">KI Insights</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Von Datum */}
        <div className="space-y-2">
          <Label>Von Datum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white",
                  !filters.fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.fromDate ? format(filters.fromDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.fromDate}
                onSelect={(date) => updateFilter('fromDate', date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Bis Datum */}
        <div className="space-y-2">
          <Label>Bis Datum</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white",
                  !filters.toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.toDate ? format(filters.toDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
              <Calendar
                mode="single"
                selected={filters.toDate}
                onSelect={(date) => updateFilter('toDate', date)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Toggle Row */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            id="only-unread"
            checked={filters.onlyUnread}
            onCheckedChange={(checked) => updateFilter('onlyUnread', checked)}
          />
          <Label htmlFor="only-unread" className="cursor-pointer">Nur ungelesene</Label>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="only-important"
              checked={filters.onlyImportant}
              onCheckedChange={(checked) => updateFilter('onlyImportant', checked)}
            />
            <Label htmlFor="only-important" className="cursor-pointer">Nur wichtige</Label>
          </div>
          
          <Button variant="outline" size="sm" onClick={onReset}>
            Filter zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
}
