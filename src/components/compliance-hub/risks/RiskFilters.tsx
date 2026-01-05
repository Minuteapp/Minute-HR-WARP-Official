// Compliance Hub - Risiken Filter Komponente
import React from 'react';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RiskFiltersProps {
  selectedStatus: string;
  selectedSeverity: string;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  resultCount: number;
}

export const RiskFilters: React.FC<RiskFiltersProps> = ({
  selectedStatus,
  selectedSeverity,
  onStatusChange,
  onSeverityChange,
  resultCount
}) => {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="new">Neu</SelectItem>
            <SelectItem value="in_review">In Prüfung</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSeverity} onValueChange={onSeverityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Schweregrade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Schweregrade</SelectItem>
            <SelectItem value="critical">Kritisch</SelectItem>
            <SelectItem value="high">Hoch</SelectItem>
            <SelectItem value="medium">Mittel</SelectItem>
            <SelectItem value="low">Niedrig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {resultCount} Ergebnisse
      </div>
    </div>
  );
};
