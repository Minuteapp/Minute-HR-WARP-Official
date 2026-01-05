import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import CacheStatistics from './CacheStatistics';
import PerformanceFeatureRow from './PerformanceFeatureRow';
import ScalingFeaturesList from './ScalingFeaturesList';

const PerformanceSection = () => {
  const [virtualScrolling, setVirtualScrolling] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    activeEntries: 0,
    totalEntries: 0,
    expiredEntries: 0,
    cacheSize: '0 B'
  });

  const handleClearCache = () => {
    setCacheStats({
      activeEntries: 0,
      totalEntries: 0,
      expiredEntries: 0,
      cacheSize: '0 B'
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance & Skalierung
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enterprise-optimierte Einstellungen für große Organisationen (10.000+ Mitarbeiter)
        </p>
      </CardHeader>
      <CardContent>
        <CacheStatistics
          activeEntries={cacheStats.activeEntries}
          totalEntries={cacheStats.totalEntries}
          expiredEntries={cacheStats.expiredEntries}
          cacheSize={cacheStats.cacheSize}
          onClearCache={handleClearCache}
        />
        
        <div className="space-y-0">
          <PerformanceFeatureRow
            title="Server-side Pagination"
            description="Lädt nur benötigte Datensätze (50-200 pro Seite)"
            isActive={true}
          />
          <PerformanceFeatureRow
            title="Debounced Search"
            description="300ms Verzögerung reduziert API-Calls um 90%"
            isActive={true}
          />
          <PerformanceFeatureRow
            title="Lazy Loading für Details"
            description="Projekt-Details werden erst bei Bedarf geladen"
            isActive={true}
          />
          <PerformanceFeatureRow
            title="Memoized Filters & Sorting"
            description="React useMemo optimiert Filter-Performance"
            isActive={true}
          />
          <PerformanceFeatureRow
            title="Virtual Scrolling"
            description="Rendert nur sichtbare Elemente bei großen Listen"
            showToggle={true}
            toggleValue={virtualScrolling}
            onToggleChange={setVirtualScrolling}
          />
        </div>
        
        <ScalingFeaturesList />
      </CardContent>
    </Card>
  );
};

export default PerformanceSection;
