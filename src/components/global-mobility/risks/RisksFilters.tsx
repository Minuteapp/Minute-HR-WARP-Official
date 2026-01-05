import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

interface RisksFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: string;
  onLevelChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onAddRisk: () => void;
}

export const RisksFilters = ({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelChange,
  categoryFilter,
  onCategoryChange,
  onAddRisk
}: RisksFiltersProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Risiko, Mitarbeiter..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={levelFilter} onValueChange={onLevelChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Alle Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Level</SelectItem>
          <SelectItem value="critical">Kritisch</SelectItem>
          <SelectItem value="high">Hoch</SelectItem>
          <SelectItem value="medium">Mittel</SelectItem>
          <SelectItem value="low">Niedrig</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="visa">Visa-Ablauf</SelectItem>
          <SelectItem value="tax">Steuerliche Risiken</SelectItem>
          <SelectItem value="compliance">Compliance-Verstöße</SelectItem>
          <SelectItem value="operational">Operative Risiken</SelectItem>
          <SelectItem value="legal">Rechtliche Risiken</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onAddRisk}>
        <Plus className="h-4 w-4 mr-2" />
        Risiko erfassen
      </Button>
    </div>
  );
};
