import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface PayTypeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export const PayTypeFilters = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
}: PayTypeFiltersProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Lohnart suchen..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Alle Kategorien" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="base">Grundgehalt</SelectItem>
          <SelectItem value="bonus">Bonus</SelectItem>
          <SelectItem value="overtime">Überstunden</SelectItem>
          <SelectItem value="benefit">Benefits</SelectItem>
          <SelectItem value="deduction">Abzüge</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
