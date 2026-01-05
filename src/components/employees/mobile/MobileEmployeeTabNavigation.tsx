import { Search, List, Grid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MobileEmployeeTabNavigationProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const MobileEmployeeTabNavigation = ({ viewMode, onViewModeChange }: MobileEmployeeTabNavigationProps) => {
  const totalTabs = 34;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
      {/* Suchfeld */}
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
        <Input
          placeholder="Tab suchen..."
          className="pl-8 h-8 text-[11px]"
        />
      </div>
      
      {/* Tab-Zähler und View-Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium">
          {totalTabs} von {totalTabs} Tabs
        </div>
        
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-7 w-7 p-0"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-7 w-7 p-0"
          >
            <Grid className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
