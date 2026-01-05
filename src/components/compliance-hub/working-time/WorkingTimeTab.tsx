// Compliance Hub - Arbeitszeit & Arbeitsrecht Tab (Vollständig)
import React, { useState, useMemo } from 'react';
import { WorkingTimeKPICards, WorkingTimeKPIData } from './WorkingTimeKPICards';
import { WorkingTimeAICard } from './WorkingTimeAICard';
import { ViolationsByTypeChart, ViolationTypeData } from './ViolationsByTypeChart';
import { WeeklyTrendChart, WeeklyTrendData } from './WeeklyTrendChart';
import { LocationViolationCards, LocationViolationData } from './LocationViolationCards';
import { WorkingTimeFilters } from './WorkingTimeFilters';
import { WorkingTimeViolationCard, WorkingTimeViolation } from './WorkingTimeViolationCard';

interface WorkingTimeTabProps {
  kpiData?: WorkingTimeKPIData;
  analysisText?: string;
  prognosis?: string[];
  violationsByType?: ViolationTypeData[];
  weeklyTrend?: WeeklyTrendData[];
  locationData?: LocationViolationData[];
  violations?: WorkingTimeViolation[];
}

export const WorkingTimeTab: React.FC<WorkingTimeTabProps> = ({
  kpiData,
  analysisText,
  prognosis = [],
  violationsByType = [],
  weeklyTrend = [],
  locationData = [],
  violations = []
}) => {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedViolationType, setSelectedViolationType] = useState('all');

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    violations.forEach(v => {
      if (v.location) uniqueLocations.add(v.location);
    });
    return Array.from(uniqueLocations);
  }, [violations]);

  const filteredViolations = useMemo(() => {
    return violations.filter(violation => {
      const locationMatch = selectedLocation === 'all' || violation.location === selectedLocation;
      const typeMatch = selectedViolationType === 'all' || violation.type === selectedViolationType;
      return locationMatch && typeMatch;
    });
  }, [violations, selectedLocation, selectedViolationType]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Arbeitszeit & Arbeitsrecht</h2>
        <p className="text-sm text-muted-foreground">Monitoring von Arbeitszeitverstößen & gesetzlichen Anforderungen</p>
      </div>

      {/* KPI-Karten */}
      <WorkingTimeKPICards data={kpiData} />

      {/* KI-Analyse */}
      <WorkingTimeAICard analysisText={analysisText} prognosis={prognosis} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViolationsByTypeChart data={violationsByType} />
        <WeeklyTrendChart data={weeklyTrend} />
      </div>

      {/* Standort-Karten */}
      <LocationViolationCards data={locationData} />

      {/* Filter */}
      <WorkingTimeFilters
        selectedLocation={selectedLocation}
        selectedViolationType={selectedViolationType}
        onLocationChange={setSelectedLocation}
        onViolationTypeChange={setSelectedViolationType}
        resultCount={filteredViolations.length}
        locations={locations}
      />

      {/* Verstoß-Karten */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Arbeitszeitverstöße vorhanden.</p>
            <p className="text-sm">Verstöße werden hier angezeigt, sobald sie erfasst werden.</p>
          </div>
        ) : (
          filteredViolations.map(violation => (
            <WorkingTimeViolationCard key={violation.id} violation={violation} />
          ))
        )}
      </div>
    </div>
  );
};
