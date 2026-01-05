import React from 'react';
import { LocationBarChart } from './components/LocationBarChart';
import { LocationDetailsTable } from './components/LocationDetailsTable';

export const LocationComparisonTab = () => {
  return (
    <div className="space-y-6">
      <LocationBarChart />
      <LocationDetailsTable />
    </div>
  );
};
