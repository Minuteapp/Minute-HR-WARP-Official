import React from 'react';
import { AnalyticsKPICards } from './components/AnalyticsKPICards';
import { EmissionsYearlyChart } from './components/EmissionsYearlyChart';
import { QuarterlyTrendChart } from './components/QuarterlyTrendChart';

export const TemporalTrendsTab = () => {
  return (
    <div className="space-y-6">
      <AnalyticsKPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionsYearlyChart />
        <QuarterlyTrendChart />
      </div>
    </div>
  );
};
