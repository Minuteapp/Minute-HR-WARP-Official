import React, { useState } from 'react';
import { HistoryFilterBar } from '../history/HistoryFilterBar';
import { HistoryKPICards } from '../history/HistoryKPICards';
import { HistoryEventsList } from '../history/HistoryEventsList';

export const HistoryTab = () => {
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  return (
    <div className="space-y-6">
      <HistoryFilterBar
        employeeFilter={employeeFilter}
        yearFilter={yearFilter}
        typeFilter={typeFilter}
        onEmployeeChange={setEmployeeFilter}
        onYearChange={setYearFilter}
        onTypeChange={setTypeFilter}
      />
      <HistoryKPICards />
      <HistoryEventsList
        employeeFilter={employeeFilter}
        yearFilter={yearFilter}
        typeFilter={typeFilter}
      />
    </div>
  );
};
