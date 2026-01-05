import { Archive, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ArchiveHeaderProps {
  filter: string;
  onFilterChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const ArchiveHeader = ({ filter, onFilterChange, search, onSearchChange }: ArchiveHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-lg">
          <Archive className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Archiv</h2>
          <p className="text-sm text-muted-foreground">
            Abgeschlossene Stellen und Bewerbungen
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Einträge" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Einträge</SelectItem>
            <SelectItem value="jobs">Nur Stellen</SelectItem>
            <SelectItem value="applications">Nur Bewerbungen</SelectItem>
            <SelectItem value="hired">Nur Eingestellte</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Suchen..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ArchiveHeader;
