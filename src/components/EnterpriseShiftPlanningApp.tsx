import React, { Suspense } from 'react';
import ShiftPlanning from './shift-planning/ShiftPlanning';
import { LoadingFallback } from './PerformanceOptimizations';

export function EnterpriseShiftPlanningApp() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingFallback />}>
        <ShiftPlanning />
      </Suspense>
    </div>
  );
}