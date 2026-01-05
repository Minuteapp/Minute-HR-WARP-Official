import React from 'react';
import { DepartmentBarChart } from './components/DepartmentBarChart';
import { DepartmentDetailsTable } from './components/DepartmentDetailsTable';

export const DepartmentAnalysisTab = () => {
  return (
    <div className="space-y-6">
      <DepartmentBarChart />
      <DepartmentDetailsTable />
    </div>
  );
};
