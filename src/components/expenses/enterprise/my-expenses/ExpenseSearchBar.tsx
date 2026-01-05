
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ExpenseSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

const ExpenseSearchBar = ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }: ExpenseSearchBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Alle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle</SelectItem>
          <SelectItem value="draft">Entwurf</SelectItem>
          <SelectItem value="submitted">Eingereicht</SelectItem>
          <SelectItem value="approved">Genehmigt</SelectItem>
          <SelectItem value="rejected">Abgelehnt</SelectItem>
          <SelectItem value="reimbursed">Erstattet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExpenseSearchBar;
