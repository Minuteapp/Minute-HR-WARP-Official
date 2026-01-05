import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { calculateStatistics } from '@/utils/timeReportCalculations';
import ReportStatisticsCards from '@/components/time/reports/ReportStatisticsCards';
import OverviewTab from '@/components/time/reports/OverviewTab';
import ProjectsTab from '@/components/time/reports/ProjectsTab';
import LocationTab from '@/components/time/reports/LocationTab';
import PatternsTab from '@/components/time/reports/PatternsTab';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, startOfQuarter, endOfQuarter } from 'date-fns';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [activeReportTab, setActiveReportTab] = useState("overview");

  // Datumsbereich basierend auf Periode berechnen
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'thisWeek':
        return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'lastWeek':
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
      case 'thisMonth':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case 'thisQuarter':
        return { from: startOfQuarter(now), to: endOfQuarter(now) };
      default:
        return { from: startOfMonth(now), to: endOfMonth(now) };
    }
  }, [selectedPeriod]);

  // Daten laden
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeReports', dateRange.from, dateRange.to],
    queryFn: () => timeTrackingService.getTimeEntriesByDateRange(dateRange.from, dateRange.to)
  });

  // Statistiken berechnen
  const statistics = useMemo(() => 
    calculateStatistics(timeEntries, selectedPeriod),
    [timeEntries, selectedPeriod]
  );

  const handleExportPDF = () => {
    console.log('PDF Export wird implementiert...');
    // TODO: PDF Export implementieren
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Berichte & Analysen</h2>
          <p className="text-sm text-muted-foreground">Detaillierte Auswertung Ihrer Arbeitszeiten</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">Diese Woche</SelectItem>
              <SelectItem value="lastWeek">Letzte Woche</SelectItem>
              <SelectItem value="thisMonth">Dieser Monat</SelectItem>
              <SelectItem value="lastMonth">Letzter Monat</SelectItem>
              <SelectItem value="thisQuarter">Dieses Quartal</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF exportieren
          </Button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <ReportStatisticsCards {...statistics} />

      {/* Sub-Tabs */}
      <Tabs value={activeReportTab} onValueChange={setActiveReportTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="projects">Projekte</TabsTrigger>
          <TabsTrigger value="location">Arbeitsort</TabsTrigger>
          <TabsTrigger value="patterns">Muster</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <OverviewTab data={timeEntries} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab data={timeEntries} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="location">
            <LocationTab data={timeEntries} period={selectedPeriod} />
          </TabsContent>

          <TabsContent value="patterns">
            <PatternsTab data={timeEntries} period={selectedPeriod} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Reports;
