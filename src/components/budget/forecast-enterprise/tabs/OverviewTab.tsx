import React from 'react';
import { BudgetKPICards } from '../overview/BudgetKPICards';
import { AISummaryBox } from '../overview/AISummaryBox';
import { BudgetDevelopmentChart } from '../overview/BudgetDevelopmentChart';
import { TopCostBlocksChart } from '../overview/TopCostBlocksChart';
import { CostDistributionChart } from '../overview/CostDistributionChart';
import { CriticalCostCenters } from '../overview/CriticalCostCenters';

interface OverviewTabProps {
  fiscalYear: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ fiscalYear }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <BudgetKPICards fiscalYear={fiscalYear} />

      {/* AI Summary */}
      <AISummaryBox />

      {/* Budget Development Chart */}
      <BudgetDevelopmentChart fiscalYear={fiscalYear} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCostBlocksChart />
        <CostDistributionChart />
      </div>

      {/* Critical Cost Centers */}
      <CriticalCostCenters />
    </div>
  );
};
