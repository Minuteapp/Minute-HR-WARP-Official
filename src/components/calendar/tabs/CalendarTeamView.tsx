import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

const CalendarTeamView = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', selectedTeam],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('id, name, position, avatar_url, department, team');

      if (selectedTeam !== 'all') {
        query = query.eq('team', selectedTeam);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: teamEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['team-events', selectedTeam, weekStart],
    queryFn: async () => {
      const weekEnd = addDays(weekStart, 7);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString());

      if (error) throw error;
      
      // Gruppiere Events nach Mitarbeiter und Tag
      const eventsByMemberAndDay: Record<string, Record<string, any[]>> = {};
      data.forEach(event => {
        if (event.created_by) {
          if (!eventsByMemberAndDay[event.created_by]) {
            eventsByMemberAndDay[event.created_by] = {};
          }
          const dayKey = format(new Date(event.start_time), 'yyyy-MM-dd');
          if (!eventsByMemberAndDay[event.created_by][dayKey]) {
            eventsByMemberAndDay[event.created_by][dayKey] = [];
          }
          eventsByMemberAndDay[event.created_by][dayKey].push(event);
        }
      });
      
      return eventsByMemberAndDay;
    },
  });

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-500',
      absence: 'bg-orange-500',
      shift: 'bg-green-500',
      project: 'bg-purple-500',
      training: 'bg-pink-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Team & Abteilung</h2>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Team auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wochenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading || eventsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lädt Team-Kalender...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[200px_repeat(7,minmax(120px,1fr))] gap-2 min-w-max">
                {/* Header: Mitarbeiter */}
                <div className="font-medium text-sm text-muted-foreground p-2">
                  Mitarbeiter
                </div>
                
                {/* Header: Wochentage */}
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center font-medium text-sm p-2">
                    <div>{format(day, 'EEE', { locale: de })}</div>
                    <div className="text-muted-foreground text-xs">{format(day, 'd. MMM')}</div>
                  </div>
                ))}

                {/* Mitarbeiter-Zeilen */}
                {teamMembers?.map((member) => (
                  <>
                    <div key={`member-${member.id}`} className="flex items-center gap-2 p-2 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{member.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{member.position}</div>
                      </div>
                    </div>
                    
                    {/* Events pro Tag */}
                    {weekDays.map((day) => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayEvents = teamEvents?.[member.id]?.[dayKey] || [];
                      
                      return (
                        <div key={`${member.id}-${dayKey}`} className="border border-border rounded p-1 min-h-[80px] border-t">
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: event.color || '#3B82F6', color: 'white' }}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-[10px] opacity-90">
                                  {format(new Date(event.start_time), 'HH:mm')}
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-center text-muted-foreground">
                                +{dayEvents.length - 3} weitere
                              </div>
                            )}
                            {dayEvents.length === 0 && (
                              <div className="text-xs text-center text-muted-foreground py-4">
                                -
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarTeamView;