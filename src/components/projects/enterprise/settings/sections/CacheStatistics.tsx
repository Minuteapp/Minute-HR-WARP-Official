import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CacheStatisticsProps {
  activeEntries: number;
  totalEntries: number;
  expiredEntries: number;
  cacheSize: string;
  onClearCache: () => void;
}

const CacheStatistics = ({
  activeEntries,
  totalEntries,
  expiredEntries,
  cacheSize,
  onClearCache
}: CacheStatisticsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium">Cache-Statistiken</p>
          <p className="text-sm text-muted-foreground">
            Client-side Caching für optimierte Performance
          </p>
        </div>
        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm px-2 py-1 rounded">
          □ {cacheSize}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{activeEntries}</p>
          <p className="text-sm text-muted-foreground">Aktive Einträge</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{totalEntries}</p>
          <p className="text-sm text-muted-foreground">Gesamt</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{expiredEntries}</p>
          <p className="text-sm text-muted-foreground">Abgelaufen</p>
        </div>
      </div>
      
      <Button variant="outline" onClick={onClearCache} className="w-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Cache leeren & neu laden
      </Button>
    </div>
  );
};

export default CacheStatistics;
