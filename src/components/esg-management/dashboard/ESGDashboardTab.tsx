import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CSRDWarningBanner } from './CSRDWarningBanner';
import { ESGKPICards } from './ESGKPICards';
import { EmissionsAreaChart } from './EmissionsAreaChart';
import { EmissionsCategoryDonut } from './EmissionsCategoryDonut';
import { ForecastChart } from './ForecastChart';
import { LocationOverviewTable } from './LocationOverviewTable';
import { ComplianceSection } from './ComplianceSection';

export const ESGDashboardTab = () => {
  const [subTab, setSubTab] = useState('executive');
  const [year, setYear] = useState('2024');
  const [location, setLocation] = useState('all');

  return (
    <div className="space-y-4">
      {/* Sub-Tabs und Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={subTab} onValueChange={setSubTab}>
          <TabsList className="bg-muted">
            <TabsTrigger 
              value="executive"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Executive
            </TabsTrigger>
            <TabsTrigger 
              value="detailed"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Detailliert
            </TabsTrigger>
            <TabsTrigger 
              value="locations"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Standorte
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Jahr" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Standort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Standorte</SelectItem>
              <SelectItem value="munich">München HQ</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="hamburg">Hamburg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CSRD Warning Banner */}
      <CSRDWarningBanner />

      {/* KPI Cards */}
      <ESGKPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EmissionsAreaChart />
        <EmissionsCategoryDonut />
      </div>

      {/* Forecast Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ForecastChart />
        <ComplianceSection />
      </div>

      {/* Location Table */}
      <LocationOverviewTable />
    </div>
  );
};
