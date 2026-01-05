import React from 'react';
import { BenchmarkRadarChart } from './components/BenchmarkRadarChart';
import { BenchmarkingTable } from './components/BenchmarkingTable';
import { AIInsightsCard } from './components/AIInsightsCard';

export const BenchmarkingTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BenchmarkRadarChart />
        <AIInsightsCard />
      </div>
      <BenchmarkingTable />
    </div>
  );
};
