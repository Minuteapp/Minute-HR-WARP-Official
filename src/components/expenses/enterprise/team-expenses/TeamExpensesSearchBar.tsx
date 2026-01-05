
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw, Download } from 'lucide-react';

interface TeamExpensesSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

const TeamExpensesSearchBar = ({
  searchTerm,
  onSearchChange,
  regionFilter,
  onRegionFilterChange,
  sizeFilter,
  onSizeFilterChange,
  onRefresh,
  onExport
}: TeamExpensesSearchBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Abteilung, Standort oder Verantwortlichem..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={regionFilter} onValueChange={onRegionFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Alle Regionen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Regionen</SelectItem>
          <SelectItem value="emea">EMEA</SelectItem>
          <SelectItem value="americas">Americas</SelectItem>
          <SelectItem value="apac">APAC</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sizeFilter} onValueChange={onSizeFilterChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Alle Größen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Größen</SelectItem>
          <SelectItem value="small">Klein (1-50)</SelectItem>
          <SelectItem value="medium">Mittel (51-200)</SelectItem>
          <SelectItem value="large">Groß (200+)</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" onClick={onRefresh} className="text-muted-foreground">
        <RefreshCw className="h-4 w-4 mr-2" />
        Aktualisieren
      </Button>

      <Button onClick={onExport} className="bg-purple-600 hover:bg-purple-700 text-white">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
};

export default TeamExpensesSearchBar;
