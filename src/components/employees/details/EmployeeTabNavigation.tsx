import { Search, List, Grid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EmployeeTabNavigationProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export const EmployeeTabNavigation = ({ viewMode, onViewModeChange }: EmployeeTabNavigationProps) => {
  const totalTabs = 34;

  return (
    <div className="mb-3">
      {/* Suchfeld */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tab suchen..."
          className="pl-10 h-8 text-sm"
        />
      </div>
      
      {/* Tab-Zähler und View-Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">
          {totalTabs} von {totalTabs} Tabs
        </div>
        
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-7 px-2"
          >
            <List className="w-3 h-3" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-7 px-2"
          >
            <Grid className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};