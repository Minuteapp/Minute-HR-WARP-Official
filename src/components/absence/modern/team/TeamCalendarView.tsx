import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TeamMember } from '@/types/team.types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface TeamCalendarViewProps {
  members: TeamMember[];
}

export const TeamCalendarView: React.FC<TeamCalendarViewProps> = ({ members }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Bestimme Start-Wochentag (Montag = 0, Sonntag = 6)
  const firstDayOfWeek = (monthStart.getDay() + 6) % 7;

  // Ergänze leere Tage am Anfang
  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth
  ];

  const getAbsentMembersForDay = (day: Date | null) => {
    if (!day) return [];
    
    return members.filter(member => {
      if (!member.currentAbsence) return false;
      
      return isWithinInterval(day, {
        start: member.currentAbsence.startDate,
        end: member.currentAbsence.endDate
      });
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy', { locale: de })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Heute
            </Button>
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Wochentags-Header */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Kalender-Tage */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="min-h-[120px]" />;
            }

            const absentMembers = getAbsentMembersForDay(day);
            const isToday = isSameDay(day, new Date());
            const displayedMembers = absentMembers.slice(0, 3);
            const remainingCount = absentMembers.length - displayedMembers.length;

            return (
              <div
                key={day.toISOString()}
                className={`border rounded-lg p-2 min-h-[120px] ${
                  isToday ? 'bg-primary/5 border-primary' : 'bg-background'
                }`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-primary font-bold' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {absentMembers.length > 0 && (
                  <div className="space-y-1">
                    {displayedMembers.map(member => (
                      <div
                        key={member.id}
                        className="text-xs text-blue-600 truncate"
                      >
                        {member.name.split(' ')[0]}
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{remainingCount}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
