import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, List, Grid3x3, Calendar } from 'lucide-react';
import { TeamFilters, GroupByOption, SortByOption, ViewMode } from '@/types/team.types';
import { TeamFilterPopover } from './TeamFilterPopover';

interface TeamOverviewToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: TeamFilters;
  onFilterChange: (filters: TeamFilters) => void;
  groupBy: GroupByOption;
  onGroupByChange: (groupBy: string) => void;
  sortBy: SortByOption;
  onSortByChange: (sortBy: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: string) => void;
  onExport: () => void;
}

export const TeamOverviewToolbar: React.FC<TeamOverviewToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
  groupBy,
  onGroupByChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onExport
}) => {
  return (
    <div className="space-y-4">
      {/* Erste Zeile: Suche und Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Suchfeld */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name, ID, E-Mail oder Abteilung suchen"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter-Button */}
        <TeamFilterPopover
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
        />

        {/* Export-Button */}
        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Zweite Zeile: Gruppierung, Sortierung, View-Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Gruppierung */}
          <Select value={groupBy} onValueChange={onGroupByChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Gruppierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Keine Gruppierung</SelectItem>
              <SelectItem value="department">Nach Abteilung</SelectItem>
              <SelectItem value="status">Nach Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Sortierung */}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sortierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nach Name</SelectItem>
              <SelectItem value="vacation">Nach Urlaubstagen</SelectItem>
              <SelectItem value="sick">Nach Krankheitstagen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View-Switcher */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="h-8"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('calendar')}
            className="h-8"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
