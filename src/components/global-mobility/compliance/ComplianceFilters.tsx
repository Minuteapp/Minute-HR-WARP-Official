
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ComplianceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function ComplianceFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
}: ComplianceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Compliance-Einträge durchsuchen..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="Visum">Visum</SelectItem>
          <SelectItem value="Arbeitserlaubnis">Arbeitserlaubnis</SelectItem>
          <SelectItem value="Steuern">Steuern</SelectItem>
          <SelectItem value="Sozialversicherung">Sozialversicherung</SelectItem>
          <SelectItem value="Aufenthaltstitel">Aufenthaltstitel</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
          <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
          <SelectItem value="offen">Offen</SelectItem>
          <SelectItem value="kritisch">Kritisch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
