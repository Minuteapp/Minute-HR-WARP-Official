import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock, User, Filter, Download } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, differenceInDays, startOfYear, endOfYear } from 'date-fns';
import { de } from 'date-fns/locale';

interface AbsenceHistoryTabContentProps {
  employeeId: string;
}

export const AbsenceHistoryTabContent = ({ employeeId }: AbsenceHistoryTabContentProps) => {
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterType, setFilterType] = useState('all');

  const { data: absenceRequests = [], isLoading } = useQuery({
    queryKey: ['employee-absence-history', employeeId, filterYear, filterType],
    queryFn: async () => {
      let query = supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employeeId)
        .order('start_date', { ascending: false });

      if (filterYear !== 'all') {
        const yearStart = startOfYear(new Date(parseInt(filterYear), 0, 1));
        const yearEnd = endOfYear(new Date(parseInt(filterYear), 0, 1));
        query = query
          .gte('start_date', format(yearStart, 'yyyy-MM-dd'))
          .lte('start_date', format(yearEnd, 'yyyy-MM-dd'));
      }

      if (filterType !== 'all') {
        query = query.eq('absence_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  const { data: absenceStats } = useQuery({
    queryKey: ['employee-absence-stats', employeeId, filterYear],
    queryFn: async () => {
      const yearStart = startOfYear(new Date(parseInt(filterYear), 0, 1));
      const yearEnd = endOfYear(new Date(parseInt(filterYear), 0, 1));
      
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employeeId)
        .eq('status', 'approved')
        .gte('start_date', format(yearStart, 'yyyy-MM-dd'))
        .lte('start_date', format(yearEnd, 'yyyy-MM-dd'));

      if (error) throw error;
      
      const stats = {
        totalDays: 0,
        vacationDays: 0,
        sickDays: 0,
        otherDays: 0,
        totalRequests: data?.length || 0
      };

      data?.forEach(request => {
        const days = differenceInDays(parseISO(request.end_date), parseISO(request.start_date)) + 1;
        const adjustedDays = request.half_day ? days * 0.5 : days;
        
        stats.totalDays += adjustedDays;
        
        switch (request.absence_type) {
          case 'vacation':
            stats.vacationDays += adjustedDays;
            break;
          case 'sick_leave':
            stats.sickDays += adjustedDays;
            break;
          default:
            stats.otherDays += adjustedDays;
        }
      });

      return stats;
    },
    enabled: !!employeeId
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick_leave': return 'bg-orange-100 text-orange-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Urlaub';
      case 'sick_leave': return 'Krankmeldung';
      case 'personal': return 'Persönlich';
      case 'training': return 'Weiterbildung';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      case 'pending': return 'Ausstehend';
      default: return status;
    }
  };

  const exportToCSV = () => {
    const csvData = absenceRequests.map(request => ({
      'Datum Von': format(parseISO(request.start_date), 'dd.MM.yyyy'),
      'Datum Bis': format(parseISO(request.end_date), 'dd.MM.yyyy'),
      'Typ': getTypeLabel(request.absence_type),
      'Status': getStatusLabel(request.status),
      'Tage': differenceInDays(parseISO(request.end_date), parseISO(request.start_date)) + 1,
      'Halber Tag': request.half_day ? 'Ja' : 'Nein',
      'Grund': request.reason || ''
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abwesenheiten-${employeeId}-${filterYear}.csv`;
    a.click();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Tage</p>
                <p className="text-2xl font-bold">{absenceStats?.totalDays || 0}</p>
              </div>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urlaubstage</p>
                <p className="text-2xl font-bold text-blue-600">{absenceStats?.vacationDays || 0}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Krankheitstage</p>
                <p className="text-2xl font-bold text-orange-600">{absenceStats?.sickDays || 0}</p>
              </div>
              <User className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anträge</p>
                <p className="text-2xl font-bold">{absenceStats?.totalRequests || 0}</p>
              </div>
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Abwesenheitshistorie
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jahr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Jahre</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="vacation">Urlaub</SelectItem>
                <SelectItem value="sick_leave">Krankmeldung</SelectItem>
                <SelectItem value="personal">Persönlich</SelectItem>
                <SelectItem value="training">Weiterbildung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Abwesenheitsliste */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Abwesenheiten...</p>
              </div>
            ) : absenceRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Abwesenheiten gefunden</p>
              </div>
            ) : (
              absenceRequests.map((request) => {
                const duration = differenceInDays(parseISO(request.end_date), parseISO(request.start_date)) + 1;
                const adjustedDuration = request.half_day ? duration * 0.5 : duration;

                return (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(request.absence_type)}>
                              {getTypeLabel(request.absence_type)}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusLabel(request.status)}
                            </Badge>
                            {request.half_day && (
                              <Badge variant="outline" className="text-xs">
                                Halber Tag
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">
                              {format(parseISO(request.start_date), 'dd.MM.yyyy', { locale: de })} - {format(parseISO(request.end_date), 'dd.MM.yyyy', { locale: de })}
                            </p>
                            {request.reason && (
                              <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {adjustedDuration} {adjustedDuration === 1 ? 'Tag' : 'Tage'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Eingereicht: {format(parseISO(request.created_at), 'dd.MM.yyyy')}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};