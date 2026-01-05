import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { DeviationsKPICards } from '../deviations/DeviationsKPICards';
import { DeviationTypesSelector, DeviationType } from '../deviations/DeviationTypesSelector';
import { DeviationsCategoryChart } from '../deviations/DeviationsCategoryChart';
import { DeviationsAnalysisTable } from '../deviations/DeviationsAnalysisTable';
import { CauseAnalysisSection } from '../deviations/CauseAnalysisSection';

export const DeviationsTab = () => {
  const [selectedDeviationType, setSelectedDeviationType] = useState<DeviationType>('plan-vs-forecast');

  const handleDrillDown = (category: string) => {
    console.log('Drill-down for category:', category);
    // TODO: Implement drill-down modal or navigation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Abweichungen & Analysen</h2>
          <p className="text-muted-foreground">Analysieren Sie Budgetabweichungen und deren Ursachen</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Analysezeitraum
        </Button>
      </div>

      {/* KPI Cards */}
      <DeviationsKPICards />

      {/* Deviation Types Selector */}
      <DeviationTypesSelector
        selected={selectedDeviationType}
        onSelect={setSelectedDeviationType}
      />

      {/* Category Chart */}
      <DeviationsCategoryChart deviationType={selectedDeviationType} />

      {/* Analysis Table */}
      <DeviationsAnalysisTable 
        deviationType={selectedDeviationType}
        onDrillDown={handleDrillDown}
      />

      {/* Cause Analysis */}
      <CauseAnalysisSection />
    </div>
  );
};
