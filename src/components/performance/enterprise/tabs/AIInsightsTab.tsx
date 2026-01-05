import React from 'react';
import { AIInsightsHeader } from '../aiinsights/AIInsightsHeader';
import { AIInsightsKPICards } from '../aiinsights/AIInsightsKPICards';
import { AIInsightsList } from '../aiinsights/AIInsightsList';

export const AIInsightsTab = () => {
  return (
    <div className="space-y-6">
      <AIInsightsHeader />
      <AIInsightsKPICards />
      <AIInsightsList />
    </div>
  );
};
