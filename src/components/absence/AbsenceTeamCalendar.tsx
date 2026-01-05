import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { AbsenceRequest } from '@/types/absence.types';

interface AbsenceTeamCalendarProps {
  department?: string;
  team?: string;
}

export const AbsenceTeamCalendar: React.FC<AbsenceTeamCalendarProps> = ({ department, team }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['team-absences', currentMonth, department, team],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      let query = supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'approved')
        .gte('start_date', start.toISOString())
        .lte('end_date', end.toISOString());

      if (department) {
        query = query.eq('department', department);
      }

      if (team) {
        query = query.eq('team_id', team);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Fehler beim Laden der Team-Abwesenheiten:', error);
        return [];
      }

      return data as AbsenceRequest[];
    }
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getAbsencesForDay = (day: Date) => {
    return absences.filter(absence => {
      const start = new Date(absence.start_date);
      const end = new Date(absence.end_date);
      return day >= start && day <= end;
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: 'bg-blue-100 text-blue-800 border-blue-300',
      sick_leave: 'bg-red-100 text-red-800 border-red-300',
      parental: 'bg-purple-100 text-purple-800 border-purple-300',
      business_trip: 'bg-green-100 text-green-800 border-green-300',
      other: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type] || colors.other;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick_leave: 'Krank',
      parental: 'Elternzeit',
      business_trip: 'Dienstreise',
      other: 'Sonstiges'
    };
    return labels[type] || type;
  };

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team-Abwesenheitskalender
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Lädt Kalender...
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Wochentage Header */}
            {weekdays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Leere Zellen am Anfang */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Tage */}
            {days.map(day => {
              const dayAbsences = getAbsencesForDay(day);
              const isToday = isSameDay(day, new Date());
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square border rounded-lg p-2 transition-colors ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  } ${isWeekend ? 'bg-muted/30' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <div className={`text-xs font-medium mb-1 ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {dayAbsences.slice(0, 3).map(absence => (
                        <div
                          key={absence.id}
                          className={`text-[10px] px-1 py-0.5 rounded border truncate ${getTypeColor(absence.type)}`}
                          title={`${absence.employee_name || 'Unbekannt'} - ${getTypeLabel(absence.type)}`}
                        >
                          {absence.employee_name?.split(' ')[0] || '?'}
                        </div>
                      ))}
                      {dayAbsences.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayAbsences.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legende */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs font-semibold mb-2">Legende:</div>
          <div className="flex flex-wrap gap-2">
            {['vacation', 'sick_leave', 'parental', 'business_trip', 'other'].map(type => (
              <Badge
                key={type}
                variant="outline"
                className={getTypeColor(type)}
              >
                {getTypeLabel(type)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Statistik */}
        {absences.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs font-semibold mb-2">Statistik für {format(currentMonth, 'MMMM', { locale: de })}:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abwesende Personen:</span>
                <span className="font-medium">{new Set(absences.map(a => a.user_id)).size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gesamt Abwesenheiten:</span>
                <span className="font-medium">{absences.length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
