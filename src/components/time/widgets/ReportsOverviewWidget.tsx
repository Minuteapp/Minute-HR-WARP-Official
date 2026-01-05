import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, Calendar } from "lucide-react";
import { TimeEntry } from "@/types/time-tracking.types";
import { calculateStatistics, groupByWeek } from "@/utils/timeReportCalculations";
import { startOfWeek, endOfWeek, subWeeks, getISOWeek } from "date-fns";
import { de } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTimeExport } from "@/hooks/time-tracking/useTimeExport";

interface ReportsOverviewWidgetProps {
  timeEntries: TimeEntry[];
  onViewAllReports: () => void;
}

export const ReportsOverviewWidget = ({ timeEntries, onViewAllReports }: ReportsOverviewWidgetProps) => {
  const { exportToPDF } = useTimeExport();

  // Berechne Statistiken für diese Woche
  const thisWeekStart = startOfWeek(new Date(), { locale: de });
  const thisWeekEnd = endOfWeek(new Date(), { locale: de });
  const thisWeekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    return entryDate >= thisWeekStart && entryDate <= thisWeekEnd && entry.status === 'completed';
  });

  const stats = calculateStatistics(thisWeekEntries, 'thisWeek');

  // Berechne Daten für die letzten 4 Wochen für Chart
  const last4Weeks = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = subWeeks(thisWeekStart, i);
    const weekEnd = endOfWeek(weekStart, { locale: de });
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= weekStart && entryDate <= weekEnd && entry.status === 'completed';
    });
    
    const weekStats = calculateStatistics(weekEntries, 'thisWeek');
    last4Weeks.push({
      week: `KW ${getISOWeek(weekStart)}`,
      stunden: Math.round(weekStats.totalHours * 10) / 10
    });
  }

  const handleExportWeekReport = () => {
    exportToPDF(thisWeekEntries, 'Mitarbeiter');
  };

  const handleExportMonthReport = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= monthStart && entryDate <= monthEnd && entry.status === 'completed';
    });
    exportToPDF(monthEntries, 'Mitarbeiter');
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle>Berichte & Analysen</CardTitle>
          </div>
          <Button variant="link" onClick={onViewAllReports} className="h-auto p-0">
            Alle Berichte anzeigen →
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistik-Karten */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Gesamtstunden</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {Math.round(stats.totalHours * 10) / 10}h
            </p>
            <p className="text-xs text-blue-600 mt-1">Diese Woche</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Produktivität</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {Math.round(stats.productivity)}%
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stats.productivityChange > 0 ? '↑' : '↓'} {Math.abs(stats.productivityChange)}% zum Vorzeitraum
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Ø Stunden/Tag</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {Math.round(stats.avgHoursPerDay * 10) / 10}h
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {stats.workDays} Arbeitstage
            </p>
          </div>

          <div className={`${stats.overtime >= 0 ? 'bg-orange-50' : 'bg-red-50'} rounded-lg p-4`}>
            <div className={`flex items-center gap-2 ${stats.overtime >= 0 ? 'text-orange-600' : 'text-red-600'} mb-1`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Über-/Unterzeit</span>
            </div>
            <p className={`text-2xl font-bold ${stats.overtime >= 0 ? 'text-orange-900' : 'text-red-900'}`}>
              {stats.overtime >= 0 ? '+' : ''}{Math.round(stats.overtime * 10) / 10}h
            </p>
            <p className={`text-xs ${stats.overtime >= 0 ? 'text-orange-600' : 'text-red-600'} mt-1`}>
              Aktuell
            </p>
          </div>
        </div>

        {/* Mini-Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-4">Wöchentlicher Trend (letzte 4 Wochen)</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={last4Weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}h`, 'Stunden']}
              />
              <Area 
                type="monotone" 
                dataKey="stunden" 
                stroke="#3b82f6" 
                fill="#93c5fd" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Schnellzugriffe */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportWeekReport}
          >
            Wochenbericht (PDF)
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportMonthReport}
          >
            Monatsbericht (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
