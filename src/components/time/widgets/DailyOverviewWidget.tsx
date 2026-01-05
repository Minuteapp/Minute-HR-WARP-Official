import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TimeEntry } from '@/types/time-tracking.types';
import { Edit, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DailyOverviewWidgetProps {
  date: Date;
  entries: TimeEntry[];
  onEditEntry?: (entry: TimeEntry) => void;
}

const DailyOverviewWidget = ({ date, entries, onEditEntry }: DailyOverviewWidgetProps) => {
  const queryClient = useQueryClient();

  // Realtime subscription for time_entries updates
  useEffect(() => {
    const channel = supabase
      .channel('daily-overview-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries'
        },
        () => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['todayTimeEntries'] });
          queryClient.invalidateQueries({ queryKey: ['weekTimeEntries'] });
          queryClient.invalidateQueries({ queryKey: ['activeTimeEntry'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTotalWorkTime = () => {
    return entries.reduce((total, entry) => {
      if (!entry.end_time) return total;
      const start = new Date(entry.start_time).getTime();
      const end = new Date(entry.end_time).getTime();
      const breakTime = (entry.break_minutes || 0) * 60 * 1000;
      return total + (end - start - breakTime);
    }, 0);
  };

  const calculateTotalBreakTime = () => {
    return entries.reduce((total, entry) => {
      return total + ((entry.break_minutes || 0) * 60 * 1000);
    }, 0);
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')} h`;
  };

  const workStart = entries.length > 0 ? formatTime(entries[0].start_time) : '--:--';
  const workEnd = entries.length > 0 && entries[entries.length - 1].end_time 
    ? formatTime(entries[entries.length - 1].end_time) 
    : '--:--';
  const breakCount = entries.filter(e => e.break_minutes && e.break_minutes > 0).length;

  // Timeline Rendering
  const renderTimeline = () => {
    const startHour = 8;
    const endHour = 18;
    const totalHours = endHour - startHour;
    const pixelsPerHour = 70;
    const timelineWidth = totalHours * pixelsPerHour;

    const getPositionAndWidth = (entry: TimeEntry) => {
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const startOffset = (startMinutes - startHour * 60) / 60;
      const duration = (endMinutes - startMinutes) / 60;
      
      return {
        left: Math.max(0, startOffset * pixelsPerHour),
        width: Math.max(10, duration * pixelsPerHour)
      };
    };

    const workEntries = entries.filter(e => !e.category || e.category !== 'break');

    return (
      <div className="w-full overflow-x-auto mb-4">
        <div className="py-2" style={{ minWidth: '100%', maxWidth: timelineWidth }}>
          {/* Zeitachse */}
          <div className="relative mb-2" style={{ width: timelineWidth, height: 28 }}>
            {Array.from({ length: totalHours + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-[10px] text-gray-500 font-medium"
                style={{ left: i * pixelsPerHour - 12 }}
              >
                {(startHour + i).toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative bg-gray-100 rounded-lg" style={{ width: timelineWidth, height: 56 }}>
            {/* Gitter */}
            {Array.from({ length: totalHours }).map((_, i) => (
              <div
                key={i}
                className="absolute border-l border-gray-300"
                style={{ left: i * pixelsPerHour, height: '100%' }}
              />
            ))}

            {/* Arbeitszeit-Blöcke */}
            {workEntries.map((entry, idx) => {
              const { left, width } = getPositionAndWidth(entry);
              const isBlue = entry.project?.includes('Website');
              const isOrange = entry.project?.includes('Mobile') || entry.category === 'break';
              
              return (
                <div key={entry.id || idx} className="relative">
                  <div
                    className={`absolute h-8 rounded shadow-sm cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 text-white text-[10px] font-medium ${
                      isOrange ? 'bg-orange-500' : isBlue ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                    style={{ left, width, top: 12 }}
                    title={`${entry.project || 'Allgemein'}: ${formatTime(entry.start_time)} - ${entry.end_time ? formatTime(entry.end_time) : 'Aktiv'}`}
                  >
                    <span className="truncate">{entry.project || 'Projekt'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-md">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tagesübersicht - {date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Detaillierte Aufschlüsselung Ihrer Arbeitszeit und Pausen
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-right">
              <div className="text-blue-600 font-bold text-xl">{formatDuration(calculateTotalWorkTime())}</div>
              <div className="text-gray-600 text-sm">Arbeitszeit</div>
            </div>
            <div className="text-right">
              <div className="text-orange-600 font-bold text-xl">{formatDuration(calculateTotalBreakTime())}</div>
              <div className="text-gray-600 text-sm">Pausen</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6">
        {/* Timeline Visualisierung */}
        {entries.length > 0 && renderTimeline()}

        {/* Zeiteinträge Liste */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-base">
              Keine Zeiterfassung für heute vorhanden
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isBreak = entry.category === 'break' || (entry.break_minutes && entry.break_minutes > 0);
              const duration = entry.end_time 
                ? ((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60)).toFixed(2)
                : '...';

              return (
                <div key={entry.id} className={`border rounded-xl p-4 ${isBreak ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${isBreak ? 'bg-orange-500 hover:bg-orange-500 text-white text-sm h-6 px-3' : 'bg-black hover:bg-black text-white text-sm h-6 px-3'}`}>
                          {isBreak ? 'Pause' : 'Arbeitszeit'}
                        </Badge>
                        <span className="text-base font-bold text-gray-900">
                          {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : 'Aktiv'} ({duration} h)
                        </span>
                      </div>
                      {!isBreak && (
                        <div className="text-sm text-gray-700 space-y-1.5 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📋 Projekt:</span> {entry.project || 'Allgemein'}
                          </div>
                          {entry.note && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">📝 Aufgabe:</span> {entry.note}
                            </div>
                          )}
                          {entry.department && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">💰 Kostenstelle:</span> {entry.department}
                            </div>
                          )}
                        </div>
                      )}
                      {isBreak && (
                        <div className="text-sm text-gray-700 mt-2">
                          {entry.note || 'Mittagspause'}
                        </div>
                      )}
                    </div>
                    {onEditEntry && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditEntry(entry)}
                        className="h-9 text-sm px-4"
                      >
                        <Edit className="w-4 h-4 mr-1.5" />
                        Bearbeiten
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Zusammenfassung */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Arbeitsbeginn</div>
              <div className="text-xl font-bold mt-1">{workStart}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Arbeitsende</div>
              <div className="text-xl font-bold mt-1">{workEnd}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Pausenanzahl</div>
              <div className="text-xl font-bold mt-1">{breakCount}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyOverviewWidget;
