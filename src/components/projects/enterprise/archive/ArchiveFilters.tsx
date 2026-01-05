import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ArchiveFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
}

const ArchiveFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
}: ArchiveFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Projekte durchsuchen..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="completed">Abgeschlossen</SelectItem>
          <SelectItem value="cancelled">Abgebrochen</SelectItem>
        </SelectContent>
      </Select>
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Alle Typen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="HR">HR</SelectItem>
          <SelectItem value="IT">IT</SelectItem>
          <SelectItem value="ESG">ESG</SelectItem>
          <SelectItem value="Compliance">Compliance</SelectItem>
          <SelectItem value="Innovation">Innovation</SelectItem>
          <SelectItem value="Business">Business</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ArchiveFilters;
