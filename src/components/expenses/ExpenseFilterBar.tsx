
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter, X } from 'lucide-react';
import { ExpenseFilter } from '@/types/expenses';

interface ExpenseFilterBarProps {
  filter: ExpenseFilter;
  onFilterChange: (filter: ExpenseFilter) => void;
}

const ExpenseFilterBar = ({ filter, onFilterChange }: ExpenseFilterBarProps) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filter, searchQuery: value });
  };

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({ ...filter, status: undefined });
    } else {
      onFilterChange({ ...filter, status: [value as any] });
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({ ...filter, category: undefined });
    } else {
      onFilterChange({ ...filter, category: [value as any] });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = filter.status?.length || filter.category?.length || filter.searchQuery;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Ausgaben suchen..."
          value={filter.searchQuery || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select 
          value={filter.status?.[0] || 'all'} 
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="submitted">Eingereicht</SelectItem>
            <SelectItem value="in_review">In Prüfung</SelectItem>
            <SelectItem value="approved">Genehmigt</SelectItem>
            <SelectItem value="rejected">Abgelehnt</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filter.category?.[0] || 'all'} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            <SelectItem value="travel">Reisekosten</SelectItem>
            <SelectItem value="accommodation">Unterkunft</SelectItem>
            <SelectItem value="meals">Verpflegung</SelectItem>
            <SelectItem value="training">Weiterbildung</SelectItem>
            <SelectItem value="equipment">Ausrüstung</SelectItem>
            <SelectItem value="office_supplies">Büromaterial</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="telecommunications">Telekommunikation</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="entertainment">Bewirtung</SelectItem>
            <SelectItem value="other">Sonstiges</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Filter löschen
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilterBar;
