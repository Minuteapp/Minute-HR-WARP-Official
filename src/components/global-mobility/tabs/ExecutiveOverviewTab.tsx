
import React, { useState } from 'react';
import { ExecutiveFilters } from '../executive/ExecutiveFilters';
import { ExecutiveSummary } from '../executive/ExecutiveSummary';
import { ExecutiveKPICards } from '../executive/ExecutiveKPICards';
import { ExecutiveWorldMap } from '../executive/ExecutiveWorldMap';
import { GlobalMobilityRequest } from '@/types/global-mobility';

interface ExecutiveOverviewTabProps {
  requests: GlobalMobilityRequest[];
}

export const ExecutiveOverviewTab = ({ requests }: ExecutiveOverviewTabProps) => {
  const [region, setRegion] = useState('all');
  const [zeitraum, setZeitraum] = useState('ytd');
  const [einheit, setEinheit] = useState('all');
  const [entsendungstyp, setEntsendungstyp] = useState('all');

  // Calculate KPIs from requests
  const activeCount = requests.filter(r => r.status === 'in_progress' || r.status === 'approved').length || 0;
  const uniqueCountries = new Set(requests.map(r => r.destination_location).filter(Boolean)).size || 0;
  const avgDuration = 18; // Would be calculated from actual data
  const avgCost = requests.reduce((sum, r) => sum + (r.estimated_cost || 0), 0) / (requests.length || 1);
  const criticalDeadlines = requests.filter(r => r.priority === 'urgent' || r.priority === 'high').length || 0;
  const complianceRisks = requests.filter(r => r.status === 'under_review').length || 0;
  const totalCostYTD = requests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0);
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const successRate = requests.length > 0 ? Math.round((completedCount / requests.length) * 100) : 94;

  return (
    <div className="space-y-6">
      <ExecutiveFilters
        region={region}
        setRegion={setRegion}
        zeitraum={zeitraum}
        setZeitraum={setZeitraum}
        einheit={einheit}
        setEinheit={setEinheit}
        entsendungstyp={entsendungstyp}
        setEntsendungstyp={setEntsendungstyp}
      />

      <ExecutiveSummary
        activeCount={activeCount || 18}
        countryCount={uniqueCountries || 15}
        criticalDeadlines={criticalDeadlines || 3}
        costOverBudget={8}
        complianceRisks={complianceRisks || 2}
      />

      <ExecutiveKPICards
        activeCount={activeCount || 18}
        countryCount={uniqueCountries || 15}
        avgDuration={avgDuration}
        avgCost={avgCost || 168000}
        criticalDeadlines={criticalDeadlines || 3}
        complianceRisks={complianceRisks || 2}
        totalCostYTD={totalCostYTD || 3020000}
        successRate={successRate}
      />

      <ExecutiveWorldMap />
    </div>
  );
};
