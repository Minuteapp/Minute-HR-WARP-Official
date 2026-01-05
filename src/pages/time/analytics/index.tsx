
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, Filter, BarChart, PieChart, Clock, TrendingUp } from "lucide-react";
import WorkHoursChart from "./components/WorkHoursChart";
import TimeDistributionChart from "./components/TimeDistributionChart";
import ProjectTimeDistribution from "./components/ProjectTimeDistribution";
import PresenceOverview from "./components/PresenceOverview";
import { useQuery } from "@tanstack/react-query";
import { timeTrackingService } from "@/services/timeTrackingService";

// ViewMode Typ definieren
type ViewMode = "day" | "week" | "month" | "year";

const TimeTrackingAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ from: new Date(new Date().setDate(new Date().getDate() - 30)), to: new Date() });
  const [selectedView, setSelectedView] = useState<ViewMode>("month");

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['timeAnalytics', dateRange.from, dateRange.to],
    queryFn: () => timeTrackingService.getTimeEntriesByDateRange(dateRange.from, dateRange.to)
  });

  const handleExport = (format: string) => {
    console.log(`Exporting data in ${format} format...`);
    // Hier würde die Export-Funktion implementiert werden
  };

  return (
    <div className="w-full py-6 space-y-6 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Zeiterfassung Analytics</h1>
        
        <div className="flex flex-wrap gap-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to });
              }
            }}
          />
          
          <Select value={selectedView} onValueChange={(value: ViewMode) => setSelectedView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ansicht" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Tag</SelectItem>
              <SelectItem value="week">Woche</SelectItem>
              <SelectItem value="month">Monat</SelectItem>
              <SelectItem value="year">Jahr</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">
            <BarChart className="h-4 w-4 mr-2" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <PieChart className="h-4 w-4 mr-2" />
            Zeitverteilung
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Clock className="h-4 w-4 mr-2" />
            Projekte
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {isLoading ? (
            <Card className="p-8">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </Card>
          ) : (
            <>
              <TabsContent value="overview" className="space-y-6">
                <WorkHoursChart 
                  data={timeEntries || []} 
                  viewMode={selectedView} 
                />
                <PresenceOverview 
                  data={timeEntries || []} 
                  dateRange={dateRange}
                />
              </TabsContent>
              
              <TabsContent value="distribution" className="space-y-6">
                <TimeDistributionChart 
                  data={timeEntries || []} 
                  viewMode={selectedView}
                />
              </TabsContent>
              
              <TabsContent value="projects" className="space-y-6">
                <ProjectTimeDistribution 
                  data={timeEntries || []} 
                  dateRange={dateRange}
                />
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Zeiterfassungstrends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-12">
                      Trend-Analyse wird geladen...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default TimeTrackingAnalyticsPage;
