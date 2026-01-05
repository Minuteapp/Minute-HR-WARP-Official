import React from 'react';
import { WorkflowKPICards } from '../overview/WorkflowKPICards';
import { AIOptimizationSuggestions } from '../overview/AIOptimizationSuggestions';
import { WorkflowsList } from '../overview/WorkflowsList';

interface OverviewTabProps {
  onCreateNew?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onCreateNew }) => {
  return (
    <div className="space-y-6">
      <WorkflowKPICards />
      <AIOptimizationSuggestions />
      <WorkflowsList onCreateNew={onCreateNew} />
    </div>
  );
};
