
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AbsenceTeamView: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Lade alle Mitarbeiter aus der Datenbank
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, first_name, last_name, department, position')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Lade Abwesenheiten für die aktuelle Woche
  const { data: absences = [] } = useQuery({
    queryKey: ['team-absences', currentWeekStart],
    queryFn: async () => {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('absence_requests')
        .select('user_id, start_date, end_date, type, status')
        .eq('status', 'approved')
        .lte('start_date', format(weekEnd, 'yyyy-MM-dd'))
        .gte('end_date', format(currentWeekStart, 'yyyy-MM-dd'));
      
      if (error) {
        console.error('Fehler beim Laden der Abwesenheiten:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Berechne Wochentage
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  // Filtere Teammitglieder nach Abteilung
  const filteredTeamMembers = selectedDepartment === "all" 
    ? teamMembers 
    : teamMembers.filter(member => member.department === selectedDepartment);

  // Ermittle alle verfügbaren Abteilungen
  const departments = [...new Set(teamMembers.map(member => member.department).filter(Boolean))];

  // Navigiere zur vorherigen/nächsten Woche
  const prevWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Prüfe, ob ein Mitarbeiter an einem bestimmten Tag abwesend ist
  const isAbsentOnDay = (userId: string, date: Date) => {
    return absences.some(absence => 
      absence.user_id === userId && 
      new Date(absence.start_date) <= date && 
      new Date(absence.end_date) >= date
    );
  };

  // Ermittle den Abwesenheitstyp für einen bestimmten Tag
  const getAbsenceTypeOnDay = (userId: string, date: Date) => {
    const absence = absences.find(absence => 
      absence.user_id === userId && 
      new Date(absence.start_date) <= date && 
      new Date(absence.end_date) >= date
    );
    return absence ? absence.type : null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team-Abwesenheitsplaner</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="department">Abteilung</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger id="department" className="w-[180px]">
              <SelectValue placeholder="Alle Abteilungen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Abteilungen</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Vorherige Woche
          </Button>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="font-medium">
              {format(currentWeekStart, "dd. MMMM", { locale: de })} - {format(addDays(currentWeekStart, 6), "dd. MMMM yyyy", { locale: de })}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            Nächste Woche
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[200px_repeat(7,1fr)]">
            {/* Header */}
            <div className="bg-muted font-medium p-3 border-b">Mitarbeiter</div>
            {weekDays.map((day) => (
              <div 
                key={day.toString()} 
                className={`bg-muted font-medium p-2 text-center border-b border-l ${
                  isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                }`}
              >
                <div>{format(day, "EEE", { locale: de })}</div>
                <div className="text-sm">{format(day, "dd.MM.", { locale: de })}</div>
              </div>
            ))}

            {/* Team members rows */}
            {filteredTeamMembers.map((member) => (
              <React.Fragment key={member.id}>
                <div className="p-2 border-b flex flex-col justify-center">
                  <div className="font-medium">{member.name || `${member.first_name} ${member.last_name}`}</div>
                  <div className="text-xs text-muted-foreground">{member.position}, {member.department}</div>
                </div>
                {weekDays.map((day) => {
                  const isAbsent = isAbsentOnDay(member.id, day);
                  const absenceType = getAbsenceTypeOnDay(member.id, day);
                  
                  let absenceStyle = "";
                  if (isAbsent) {
                    switch (absenceType) {
                      case "vacation":
                        absenceStyle = "bg-blue-100";
                        break;
                      case "sick_leave":
                      case "sick":
                        absenceStyle = "bg-red-100";
                        break;
                      case "business_trip":
                        absenceStyle = "bg-purple-100";
                        break;
                      case "other":
                        absenceStyle = "bg-green-100";
                        break;
                      default:
                        absenceStyle = "bg-gray-100";
                    }
                  }
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={`p-2 text-center border-b border-l ${
                        isSameDay(day, new Date()) ? 'bg-primary/5' : ''
                      } ${absenceStyle}`}
                    >
                      {isAbsent && (
                        <div className="text-xs font-medium">
                          {absenceType === "vacation" && "Urlaub"}
                          {(absenceType === "sick_leave" || absenceType === "sick") && "Krank"}
                          {absenceType === "business_trip" && "Dienstreise"}
                          {absenceType === "other" && "Sonstiges"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsenceTeamView;
