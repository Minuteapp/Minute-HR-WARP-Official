import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ArchiveFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
}

export const ArchiveFilters = ({
  searchQuery,
  setSearchQuery,
  year,
  setYear,
  level,
  setLevel
}: ArchiveFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Archivierte Ziele durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Jahr" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Jahre</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Ebene" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Ebenen</SelectItem>
          <SelectItem value="company">Unternehmensziele</SelectItem>
          <SelectItem value="department">Bereichsziele</SelectItem>
          <SelectItem value="team">Teamziele</SelectItem>
          <SelectItem value="individual">Individuelle Ziele</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
