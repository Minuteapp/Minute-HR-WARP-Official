import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Building2, Users, BarChart3 } from 'lucide-react';
import { TemporalTrendsTab } from './TemporalTrendsTab';
import { LocationComparisonTab } from './LocationComparisonTab';
import { DepartmentAnalysisTab } from './DepartmentAnalysisTab';
import { BenchmarkingTab } from './BenchmarkingTab';

type SubTab = 'trends' | 'locations' | 'departments' | 'benchmarking';

const subTabs = [
  { id: 'trends' as SubTab, label: 'Zeitliche Trends', icon: TrendingUp },
  { id: 'locations' as SubTab, label: 'Standort-Vergleich', icon: Building2 },
  { id: 'departments' as SubTab, label: 'Abteilungen', icon: Users },
  { id: 'benchmarking' as SubTab, label: 'Benchmarking', icon: BarChart3 },
];

export const AnalyticsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('trends');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'trends':
        return <TemporalTrendsTab />;
      case 'locations':
        return <LocationComparisonTab />;
      case 'departments':
        return <DepartmentAnalysisTab />;
      case 'benchmarking':
        return <BenchmarkingTab />;
      default:
        return <TemporalTrendsTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysen & Auswertungen</h2>
          <p className="text-sm text-muted-foreground">Tiefgehende Datenanalysen und Vergleiche</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Analyse exportieren
        </Button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-2 flex-wrap">
        {subTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <Button
              key={tab.id}
              variant={isActive ? 'default' : 'outline'}
              className={`gap-2 ${isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <IconComponent className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};
