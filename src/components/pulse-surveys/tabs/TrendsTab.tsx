import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Building2, MapPin } from "lucide-react";
import { usePulseTrends } from "@/hooks/usePulseTrends";
import { TrendKPICards } from "../trends/TrendKPICards";
import { LongTermTrendChart } from "../trends/LongTermTrendChart";
import { DepartmentTrendsChart } from "../trends/DepartmentTrendsChart";
import { BenchmarkComparisonChart } from "../trends/BenchmarkComparisonChart";
import { InterpretationBox } from "../trends/InterpretationBox";

export const TrendsTab = () => {
  const {
    trendKPIs,
    longTermData,
    departmentTrends,
    benchmarkData,
    interpretation,
    selectedYear,
    setSelectedYear,
    selectedDepartment,
    setSelectedDepartment,
    selectedLocation,
    setSelectedLocation,
    isAreaChart,
    setIsAreaChart,
    showByDepartment,
    setShowByDepartment
  } = usePulseTrends();

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Jahr</label>
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Abteilung</label>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alle Abteilungen">Alle Abteilungen</SelectItem>
                  <SelectItem value="IT & Digital">IT & Digital</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Produktion">Produktion</SelectItem>
                  <SelectItem value="R&D">R&D</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Standorte</label>
              </div>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alle Standorte">Alle Standorte</SelectItem>
                  <SelectItem value="DACH Standorte">DACH Standorte</SelectItem>
                  <SelectItem value="Berlin">Berlin</SelectItem>
                  <SelectItem value="München">München</SelectItem>
                  <SelectItem value="Hamburg">Hamburg</SelectItem>
                  <SelectItem value="Zürich">Zürich</SelectItem>
                  <SelectItem value="Wien">Wien</SelectItem>
                  <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <TrendKPICards kpis={trendKPIs} />

      {/* Long-Term Trend Chart */}
      <LongTermTrendChart 
        data={longTermData} 
        isAreaChart={isAreaChart}
        onToggleChartType={setIsAreaChart}
      />

      {/* Department/Location Trends Chart */}
      <DepartmentTrendsChart 
        trends={departmentTrends}
        showByDepartment={showByDepartment}
        onToggleView={setShowByDepartment}
      />

      {/* Benchmark Comparison Chart */}
      <BenchmarkComparisonChart data={benchmarkData} />

      {/* Interpretation Box */}
      <InterpretationBox text={interpretation} />
    </div>
  );
};
