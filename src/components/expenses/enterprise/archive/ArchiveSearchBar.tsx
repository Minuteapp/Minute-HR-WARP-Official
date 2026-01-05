
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download } from 'lucide-react';

interface ArchiveSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onExport: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

const categories = [
  { value: 'all', label: 'Alle Kategorien' },
  { value: 'reisekosten', label: 'Reisekosten' },
  { value: 'bewirtung', label: 'Bewirtung' },
  { value: 'software', label: 'Software' },
  { value: 'arbeitsmittel', label: 'Arbeitsmittel' },
  { value: 'kommunikation', label: 'Kommunikation' },
];

const ArchiveSearchBar = ({
  searchQuery,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedCategory,
  onCategoryChange,
  onExport,
}: ArchiveSearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Suchen nach ID, Mitarbeiter oder Beschreibung..."
          className="pl-10 bg-card border-border"
        />
      </div>
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[120px] bg-card border-border">
          <SelectValue placeholder="Jahr" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {years.map((year) => (
            <SelectItem key={year} value={year}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue placeholder="Kategorie" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        variant="outline" 
        onClick={onExport}
        className="border-border"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
};

export default ArchiveSearchBar;
