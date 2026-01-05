import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfYear, endOfYear } from 'date-fns';
import { de } from 'date-fns/locale';

interface TimelineEntry {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  employee_name?: string;
  department?: string;
  reason?: string;
}

interface AbsenceTimelineProps {
  employeeId?: string;
  showAllEmployees?: boolean;
}

export const AbsenceTimeline: React.FC<AbsenceTimelineProps> = ({
  employeeId,
  showAllEmployees = false
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['absence-timeline', employeeId, selectedYear, selectedType, showAllEmployees],
    queryFn: async () => {
      let query = supabase
        .from('absence_requests')
        .select('id, type, start_date, end_date, status, employee_name, department, reason')
        .gte('start_date', `${selectedYear}-01-01`)
        .lte('end_date', `${selectedYear}-12-31`)
        .order('start_date', { ascending: false });

      if (employeeId && !showAllEmployees) {
        query = query.eq('user_id', employeeId);
      }

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TimelineEntry[];
    }
  });

  // Berechne Statistiken
  const statistics = React.useMemo(() => {
    if (!entries) return null;

    const approved = entries.filter(e => e.status === 'approved');
    const byType: Record<string, number> = {};
    let totalDays = 0;

    approved.forEach(entry => {
      const start = new Date(entry.start_date);
      const end = new Date(entry.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      totalDays += days;
      byType[entry.type] = (byType[entry.type] || 0) + days;
    });

    return {
      totalDays,
      byType,
      totalEntries: entries.length,
      approvedEntries: approved.length
    };
  }, [entries]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      sick_leave: 'Krankheit',
      personal: 'Persönlich',
      training: 'Fortbildung',
      parental: 'Elternzeit',
      homeoffice: 'Homeoffice',
      business_trip: 'Dienstreise',
      sabbatical: 'Sabbatical'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: 'bg-green-100 text-green-800 border-green-200',
      sick: 'bg-red-100 text-red-800 border-red-200',
      sick_leave: 'bg-red-100 text-red-800 border-red-200',
      personal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      training: 'bg-blue-100 text-blue-800 border-blue-200',
      parental: 'bg-purple-100 text-purple-800 border-purple-200',
      homeoffice: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      business_trip: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Genehmigt</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Ausstehend</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Abwesenheits-Historie
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="vacation">Urlaub</SelectItem>
                <SelectItem value="sick">Krankheit</SelectItem>
                <SelectItem value="homeoffice">Homeoffice</SelectItem>
                <SelectItem value="training">Fortbildung</SelectItem>
                <SelectItem value="business_trip">Dienstreise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiken */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{statistics.totalDays}</p>
              <p className="text-xs text-muted-foreground">Tage gesamt</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statistics.byType['vacation'] || 0}</p>
              <p className="text-xs text-muted-foreground">Urlaubstage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{(statistics.byType['sick'] || 0) + (statistics.byType['sick_leave'] || 0)}</p>
              <p className="text-xs text-muted-foreground">Krankheitstage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.totalEntries}</p>
              <p className="text-xs text-muted-foreground">Einträge</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertikale Linie */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {entries?.map((entry, index) => (
              <div key={entry.id} className="relative pl-10">
                {/* Punkt auf der Timeline */}
                <div className={`absolute left-2.5 top-3 h-3 w-3 rounded-full border-2 border-background ${
                  entry.status === 'approved' ? 'bg-primary' : 
                  entry.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

                <div className={`p-4 rounded-lg border ${getTypeColor(entry.type)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      {showAllEmployees && entry.employee_name && (
                        <p className="font-medium mb-1">{entry.employee_name}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getTypeColor(entry.type)}>
                          {getTypeLabel(entry.type)}
                        </Badge>
                        {getStatusBadge(entry.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(entry.start_date), 'dd. MMMM yyyy', { locale: de })}
                          {entry.start_date !== entry.end_date && (
                            <> — {format(new Date(entry.end_date), 'dd. MMMM yyyy', { locale: de })}</>
                          )}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{entry.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keine Einträge */}
        {(!entries || entries.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keine Abwesenheiten für {selectedYear} gefunden</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
