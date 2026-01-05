import { useState } from 'react';
import { EmployeeTabNavigation } from './EmployeeTabNavigation';
import { EmployeeTabGroups } from './EmployeeTabGroups';
import { EmployeeAllTabsGrid } from './EmployeeAllTabsGrid';

interface EmployeeSubNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
}

export const EmployeeSubNavigation = ({ currentTab, onTabChange, isOwnProfile = false }: EmployeeSubNavigationProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  return (
    <div className="bg-card rounded-lg border border-primary/20 shadow-md p-3">
      <EmployeeTabNavigation 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {viewMode === 'list' ? (
        <EmployeeTabGroups 
          currentTab={currentTab}
          onTabChange={onTabChange}
          isOwnProfile={isOwnProfile}
        />
      ) : (
        <EmployeeAllTabsGrid 
          currentTab={currentTab}
          onTabChange={onTabChange}
          isOwnProfile={isOwnProfile}
        />
      )}
    </div>
  );
};
