import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, TrendingUp, TrendingDown, BarChart3, Calendar, Download, AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInHours, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface WorkTimeAnalysisTabContentProps {
  employeeId: string;
}

export const WorkTimeAnalysisTabContent = ({ employeeId }: WorkTimeAnalysisTabContentProps) => {
  const [period, setPeriod] = useState('month');
  const [showDetails, setShowDetails] = useState(false);

  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['employee-work-time-analysis', employeeId, period],
    queryFn: async () => {
      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          endDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', employeeId)
        .gte('start_time', format(startDate, 'yyyy-MM-dd'))
        .lte('start_time', format(endDate, 'yyyy-MM-dd'))
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  // Arbeitszeitmuster-Analyse
  const workTimeAnalysis = () => {
    if (!timeEntries.length) return null;

    const dailyHours: { [key: string]: number } = {};
    const hourlyDistribution: { [key: number]: number } = {};
    let totalHours = 0;
    let totalDays = 0;
    let overtimeHours = 0;
    let breakTimeTotal = 0;

    timeEntries.forEach(entry => {
      if (entry.end_time) {
        const startTime = parseISO(entry.start_time);
        const endTime = parseISO(entry.end_time);
        const duration = differenceInHours(endTime, startTime);
        const breakMinutes = entry.break_minutes || 0;
        const workHours = duration - (breakMinutes / 60);
        
        const dateKey = format(startTime, 'yyyy-MM-dd');
        dailyHours[dateKey] = (dailyHours[dateKey] || 0) + workHours;
        
        totalHours += workHours;
        breakTimeTotal += breakMinutes;
        
        // Überstunden (mehr als 8h pro Tag)
        if (workHours > 8) {
          overtimeHours += workHours - 8;
        }

        // Stündliche Verteilung
        for (let hour = startTime.getHours(); hour <= endTime.getHours(); hour++) {
          hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
        }
      }
    });

    totalDays = Object.keys(dailyHours).length;
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;
    const avgBreakMinutes = timeEntries.length > 0 ? breakTimeTotal / timeEntries.length : 0;

    // Frühe und späte Arbeitszeiten identifizieren
    const earlyStarts = timeEntries.filter(entry => {
      const hour = parseISO(entry.start_time).getHours();
      return hour < 7;
    }).length;

    const lateEnds = timeEntries.filter(entry => {
      if (entry.end_time) {
        const hour = parseISO(entry.end_time).getHours();
        return hour > 20;
      }
      return false;
    }).length;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalDays,
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      avgBreakMinutes: Math.round(avgBreakMinutes),
      earlyStarts,
      lateEnds,
      dailyHours,
      hourlyDistribution,
      workPattern: getWorkPattern(dailyHours),
      complianceIssues: getComplianceIssues(timeEntries)
    };
  };

  const getWorkPattern = (dailyHours: { [key: string]: number }) => {
    const hours = Object.values(dailyHours);
    const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
    const variance = hours.reduce((acc, hour) => acc + Math.pow(hour - avg, 2), 0) / hours.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 1) return { type: 'Regelmäßig', color: 'text-green-600', description: 'Sehr konstante Arbeitszeiten' };
    if (stdDev < 2) return { type: 'Mäßig variabel', color: 'text-yellow-600', description: 'Leichte Schwankungen in den Arbeitszeiten' };
    return { type: 'Unregelmäßig', color: 'text-red-600', description: 'Stark schwankende Arbeitszeiten' };
  };

  const getComplianceIssues = (entries: any[]) => {
    const issues = [];
    
    entries.forEach(entry => {
      if (entry.end_time) {
        const startTime = parseISO(entry.start_time);
        const endTime = parseISO(entry.end_time);
        const duration = differenceInHours(endTime, startTime);
        const breakMinutes = entry.break_minutes || 0;
        
        // Arbeitszeitgesetz Prüfungen
        if (duration > 10) {
          issues.push({
            date: format(startTime, 'dd.MM.yyyy'),
            type: 'Überlange Arbeitszeit',
            description: `${duration}h Arbeitszeit (max. 10h erlaubt)`
          });
        }
        
        if (duration > 6 && breakMinutes < 30) {
          issues.push({
            date: format(startTime, 'dd.MM.yyyy'),
            type: 'Pausenzeit unzureichend',
            description: `Nur ${breakMinutes} Min. Pause bei ${duration}h Arbeitszeit`
          });
        }
      }
    });

    return issues;
  };

  const analysis = workTimeAnalysis();

  const exportAnalysis = () => {
    if (!analysis) return;

    const csvData = [
      ['Arbeitszeit-Analyse', ''],
      ['Zeitraum', period === 'week' ? 'Diese Woche' : period === 'month' ? 'Dieser Monat' : 'Dieses Quartal'],
      ['', ''],
      ['Gesamtstunden', analysis.totalHours],
      ['Arbeitstage', analysis.totalDays],
      ['Durchschnitt/Tag', analysis.avgHoursPerDay],
      ['Überstunden', analysis.overtimeHours],
      ['Durchschn. Pause (Min)', analysis.avgBreakMinutes],
      ['Frühe Starts (<7h)', analysis.earlyStarts],
      ['Späte Enden (>20h)', analysis.lateEnds],
      ['Arbeitsmuster', analysis.workPattern.type],
      ['', ''],
      ['Tägliche Arbeitszeiten', ''],
      ...Object.entries(analysis.dailyHours).map(([date, hours]) => [date, hours])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbeitszeit-analyse-${employeeId}-${period}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header mit Zeitraum-Auswahl */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Arbeitszeitmuster-Analyse
            </CardTitle>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                  <SelectItem value="quarter">Dieses Quartal</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAnalysis} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lade Arbeitszeitdaten...</p>
        </div>
      ) : !analysis ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine Arbeitszeitdaten für den gewählten Zeitraum</p>
        </div>
      ) : (
        <>
          {/* Kennzahlen */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamtstunden</p>
                    <p className="text-2xl font-bold">{analysis.totalHours}h</p>
                  </div>
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">⌀ Stunden/Tag</p>
                    <p className="text-2xl font-bold">{analysis.avgHoursPerDay}h</p>
                  </div>
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Überstunden</p>
                    <p className="text-2xl font-bold text-orange-600">{analysis.overtimeHours}h</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">⌀ Pause</p>
                    <p className="text-2xl font-bold">{analysis.avgBreakMinutes} Min</p>
                  </div>
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Arbeitsmuster */}
          <Card>
            <CardHeader>
              <CardTitle>Arbeitsmuster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${analysis.workPattern.color} bg-transparent border`}>
                      {analysis.workPattern.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {analysis.workPattern.description}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Frühe Starts (&lt;7h)</span>
                      <Badge variant="outline">{analysis.earlyStarts}x</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Späte Enden (&gt;20h)</span>
                      <Badge variant="outline">{analysis.lateEnds}x</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Arbeitstage</span>
                      <Badge variant="outline">{analysis.totalDays}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Tägliche Arbeitszeiten</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(analysis.dailyHours)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 10)
                      .map(([date, hours]) => (
                      <div key={date} className="flex justify-between items-center text-sm">
                        <span>{format(parseISO(date), 'dd.MM.yyyy', { locale: de })}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min((hours / 12) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right">{Math.round(hours * 10) / 10}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance-Warnungen */}
          {analysis.complianceIssues.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance-Hinweise ({analysis.complianceIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.complianceIssues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{issue.date}</span>
                          <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};