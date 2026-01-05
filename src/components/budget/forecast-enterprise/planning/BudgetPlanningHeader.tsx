import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download, Plus } from 'lucide-react';

interface BudgetPlanningHeaderProps {
  onNewBudget: () => void;
  onFilter: () => void;
}

export const BudgetPlanningHeader: React.FC<BudgetPlanningHeaderProps> = ({ onNewBudget, onFilter }) => {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Budgetplanung</h2>
        <p className="text-sm text-muted-foreground">Verwaltung aller Budget-Ebenen und -Typen</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onFilter}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={onNewBudget}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Budget
        </Button>
      </div>
    </div>
  );
};
