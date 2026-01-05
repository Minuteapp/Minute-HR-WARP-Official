import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Users, AlertTriangle, Download, Filter } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, differenceInDays, parseISO, addMonths, subMonths, isWeekend } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
}

interface TeamAbsence {
  id: string;
  user_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  absence_type: string;
  status: string;
  half_day?: boolean;
  reason?: string;
}

interface ConflictInfo {
  date: string;
  conflictingMembers: string[];
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

interface TeamVacationPlannerProps {
  defaultDepartment?: string;
}

export const TeamVacationPlanner = ({ defaultDepartment }: TeamVacationPlannerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState(defaultDepartment || 'all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [view, setView] = useState<'month' | 'quarter'>('month');
  const { toast } = useToast();

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null);
      
      if (error) throw error;
      
      const uniqueDepts = [...new Set(data?.map(emp => emp.department))];
      return uniqueDepts.filter(Boolean);
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams', selectedDepartment],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('team')
        .not('team', 'is', null);
      
      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const uniqueTeams = [...new Set(data?.map(emp => emp.team))];
      return uniqueTeams.filter(Boolean);
    },
    enabled: selectedDepartment !== 'all'
  });

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', selectedDepartment, selectedTeam],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('id, name, department, position, team')
        .eq('status', 'active');

      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment);
      }
      
      if (selectedTeam !== 'all') {
        query = query.eq('team', selectedTeam);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    }
  });

  const { data: absences = [], isLoading: absencesLoading } = useQuery({
    queryKey: ['team-absences', currentDate, selectedDepartment, selectedTeam],
    queryFn: async () => {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      let query = supabase
        .from('absence_requests')
        .select('*')
        .in('status', ['approved', 'pending'])
        .gte('start_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('end_date', format(monthEnd, 'yyyy-MM-dd'));

      if (selectedDepartment !== 'all') {
        query = query.eq('department', selectedDepartment);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    }
  });

  // Konflikte analysieren
  const analyzeConflicts = (): ConflictInfo[] => {
    if (!teamMembers.length || !absences.length) return [];

    const conflicts: ConflictInfo[] = [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    daysInMonth.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayAbsences = absences.filter(absence => {
        const start = parseISO(absence.start_date);
        const end = parseISO(absence.end_date);
        return day >= start && day <= end && absence.status === 'approved';
      });

      if (dayAbsences.length > 0) {
        const absentCount = dayAbsences.length;
        const totalTeamSize = teamMembers.length;
        const absentPercentage = (absentCount / totalTeamSize) * 100;
        
        let severity: 'low' | 'medium' | 'high' = 'low';
        let recommendedAction = '';

        if (absentPercentage >= 50) {
          severity = 'high';
          recommendedAction = 'Kritisch: Über 50% des Teams abwesend. Externe Unterstützung prüfen.';
        } else if (absentPercentage >= 30) {
          severity = 'medium';
          recommendedAction = 'Achtung: 30%+ des Teams abwesend. Aufgabenverteilung anpassen.';
        } else if (absentPercentage >= 20) {
          severity = 'low';
          recommendedAction = 'Monitoring: 20%+ des Teams abwesend. Bereitschaft sicherstellen.';
        }

        if (severity !== 'low' || isWeekend(day)) {
          conflicts.push({
            date: dayStr,
            conflictingMembers: dayAbsences.map(a => a.employee_name),
            severity,
            recommendedAction
          });
        }
      }
    });

    return conflicts;
  };

  const conflicts = analyzeConflicts();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const getAbsencesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return absences.filter(absence => {
      const start = parseISO(absence.start_date);
      const end = parseISO(absence.end_date);
      return date >= start && date <= end;
    });
  };

  const getAbsenceTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-500';
      case 'sick_leave': return 'bg-red-500';
      case 'personal': return 'bg-purple-500';
      case 'training': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAbsenceTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Urlaub';
      case 'sick_leave': return 'Krank';
      case 'personal': return 'Persönlich';
      case 'training': return 'Fortbildung';
      default: return type;
    }
  };

  const exportTeamCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const csvData = absences.map(absence => ({
      'Mitarbeiter': absence.employee_name,
      'Abteilung': absence.department || '',
      'Von': format(parseISO(absence.start_date), 'dd.MM.yyyy'),
      'Bis': format(parseISO(absence.end_date), 'dd.MM.yyyy'),
      'Typ': getAbsenceTypeLabel(absence.absence_type),
      'Status': absence.status === 'approved' ? 'Genehmigt' : 'Ausstehend',
      'Tage': differenceInDays(parseISO(absence.end_date), parseISO(absence.start_date)) + 1,
      'Grund': absence.reason || ''
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-urlaubsplanung-${format(currentDate, 'yyyy-MM')}.csv`;
    a.click();

    toast({
      title: "Export erfolgreich",
      description: "Team-Urlaubsplanung wurde als CSV exportiert."
    });
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-4">
        {/* Kalender Header */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="bg-gray-50 p-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Kalender Raster */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {days.map(day => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayAbsences = getAbsencesForDate(day);
            const hasConflict = conflicts.some(c => c.date === format(day, 'yyyy-MM-dd'));
            const conflict = conflicts.find(c => c.date === format(day, 'yyyy-MM-dd'));

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 bg-white ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'ring-2 ring-primary' : ''} ${
                  hasConflict && conflict?.severity === 'high' ? 'bg-red-50' :
                  hasConflict && conflict?.severity === 'medium' ? 'bg-orange-50' :
                  hasConflict && conflict?.severity === 'low' ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasConflict && (
                    <AlertTriangle 
                      className={`h-4 w-4 ${
                        conflict?.severity === 'high' ? 'text-red-500' :
                        conflict?.severity === 'medium' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  {dayAbsences.slice(0, 3).map(absence => (
                    <div
                      key={absence.id}
                      className={`text-xs p-1 rounded text-white truncate ${getAbsenceTypeColor(absence.absence_type)}`}
                      title={`${absence.employee_name} - ${getAbsenceTypeLabel(absence.absence_type)}`}
                    >
                      {absence.employee_name}
                      {absence.status === 'pending' && (
                        <span className="ml-1 text-yellow-200">⏳</span>
                      )}
                    </div>
                  ))}
                  
                  {dayAbsences.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayAbsences.length - 3} weitere
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header mit Navigation und Filtern */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Team-Urlaubsplanung
            </CardTitle>
            <div className="flex items-center gap-4">
              <Button onClick={exportTeamCalendar} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button onClick={() => navigateMonth('prev')} variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: de })}
              </h3>
              <Button onClick={() => navigateMonth('next')} variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Abteilung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedDepartment !== 'all' && teams.length > 0 && (
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Team wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{teamMembers.length} Teammitglieder</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{absences.filter(a => a.status === 'approved').length} genehmigte Abwesenheiten</span>
            </div>
            {conflicts.length > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{conflicts.length} potentielle Konflikte</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Konflikt-Warnungen */}
      {conflicts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Konflikt-Analyse ({conflicts.length} gefunden)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {conflicts.map((conflict, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  conflict.severity === 'high' ? 'bg-red-50 border-red-200' :
                  conflict.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {format(parseISO(conflict.date), 'dd.MM.yyyy (EEEE)', { locale: de })}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Abwesend: {conflict.conflictingMembers.join(', ')}
                      </div>
                      <div className="text-sm mt-2">{conflict.recommendedAction}</div>
                    </div>
                    <Badge variant={
                      conflict.severity === 'high' ? 'destructive' :
                      conflict.severity === 'medium' ? 'secondary' : 'default'
                    }>
                      {conflict.severity === 'high' ? 'Kritisch' :
                       conflict.severity === 'medium' ? 'Achtung' : 'Info'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kalender */}
      <Card>
        <CardContent className="p-6">
          {membersLoading || absencesLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Lade Team-Daten...</p>
            </div>
          ) : (
            renderCalendarGrid()
          )}
        </CardContent>
      </Card>

      {/* Legende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Urlaub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Krankmeldung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Fortbildung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Persönlich</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm">Kritischer Konflikt</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Mittlerer Konflikt</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Niedrig-Konflikt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-200 text-sm">⏳</span>
              <span className="text-sm">Ausstehend</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};