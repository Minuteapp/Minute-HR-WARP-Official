import React from 'react';
import SmartInsightsDashboard from '@/components/ai/SmartInsightsDashboard';

const SmartInsightsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <SmartInsightsDashboard />
      </div>
    </div>
  );
};

export default SmartInsightsPage;