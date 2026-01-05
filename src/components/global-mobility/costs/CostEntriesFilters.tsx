import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CostEntriesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

export const CostEntriesFilters = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange
}: CostEntriesFiltersProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Mitarbeiter, Beschreibung..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="relocation">Relocation-Kosten</SelectItem>
          <SelectItem value="housing">Wohnkosten</SelectItem>
          <SelectItem value="travel">Reisekosten</SelectItem>
          <SelectItem value="taxes">Steuern & Abgaben</SelectItem>
          <SelectItem value="benefits">Zusatzleistungen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
