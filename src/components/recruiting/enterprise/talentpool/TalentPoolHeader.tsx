import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TalentPoolHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TalentPoolHeader = ({ searchQuery, onSearchChange }: TalentPoolHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Talentpool</h2>
        <p className="text-sm text-muted-foreground">
          Verwaltung von qualifizierten Kandidaten für zukünftige Positionen
        </p>
      </div>
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kandidaten suchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
};

export default TalentPoolHeader;
