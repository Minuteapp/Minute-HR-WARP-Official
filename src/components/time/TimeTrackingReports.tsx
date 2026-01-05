import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";
import { TimeEntry } from "@/types/time-tracking.types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import { de } from "date-fns/locale";
import ReportStatisticsCards from "./reports/ReportStatisticsCards";
import OverviewTab from "./reports/OverviewTab";
import ProjectsTab from "./reports/ProjectsTab";
import LocationTab from "./reports/LocationTab";
import PatternsTab from "./reports/PatternsTab";
import { calculateStatistics } from "@/utils/timeReportCalculations";
import { useTimeExport } from "@/hooks/time-tracking/useTimeExport";

const TimeTrackingReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [activeTab, setActiveTab] = useState("overview");
  const { exportToPDF } = useTimeExport();

  // Daten für Berichte laden
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => timeTrackingService.getTimeEntries(),
    refetchInterval: 30000,
  });

  // Zeitraum-Berechnung
  const getPeriodDates = (period: string) => {
    const now = new Date();
    switch (period) {
      case "thisWeek":
        return { start: startOfWeek(now, { locale: de }), end: endOfWeek(now, { locale: de }) };
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "lastWeek":
        const lastWeek = subWeeks(now, 1);
        return { start: startOfWeek(lastWeek, { locale: de }), end: endOfWeek(lastWeek, { locale: de }) };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start: periodStart, end: periodEnd } = getPeriodDates(selectedPeriod);

  // Gefilterte Einträge für den gewählten Zeitraum
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry: TimeEntry) => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= periodStart && entryDate <= periodEnd && entry.status === 'completed';
    });
  }, [timeEntries, periodStart, periodEnd]);

  // Statistiken berechnen
  const stats = useMemo(() => calculateStatistics(filteredEntries, selectedPeriod), [filteredEntries, selectedPeriod]);

  const handleExportPDF = () => {
    exportToPDF(filteredEntries, 'Mitarbeiter');
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'projects', label: 'Projekte' },
    { id: 'location', label: 'Arbeitsort' },
    { id: 'patterns', label: 'Muster' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-gray-500">Lädt Berichte...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Berichte & Analysen</h1>
            <p className="text-gray-600 mt-1">Detaillierte Auswertung Ihrer Arbeitszeiten</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisWeek">Diese Woche</SelectItem>
                <SelectItem value="thisMonth">Dieser Monat</SelectItem>
                <SelectItem value="lastWeek">Letzte Woche</SelectItem>
                <SelectItem value="lastMonth">Letzter Monat</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} className="bg-black hover:bg-gray-800 text-white">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Statistik-Karten */}
      <ReportStatisticsCards
        totalHours={stats.totalHours}
        targetHours={stats.targetHours}
        productivity={stats.productivity}
        productivityChange={stats.productivityChange}
        avgHoursPerDay={stats.avgHoursPerDay}
        workDays={stats.workDays}
        overtime={stats.overtime}
      />

      {/* Tabs Navigation */}
      <div className="bg-gray-100 rounded-lg p-1 inline-flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && <OverviewTab data={filteredEntries} period={selectedPeriod} />}
        {activeTab === 'projects' && <ProjectsTab data={filteredEntries} period={selectedPeriod} />}
        {activeTab === 'location' && <LocationTab data={filteredEntries} period={selectedPeriod} />}
        {activeTab === 'patterns' && <PatternsTab data={filteredEntries} period={selectedPeriod} />}
      </div>
    </div>
  );
};

export default TimeTrackingReports;