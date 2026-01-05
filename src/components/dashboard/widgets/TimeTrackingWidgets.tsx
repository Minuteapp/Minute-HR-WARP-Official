import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  project: string | null;
  description: string | null;
  status: string;
}

export const CurrentStatusWidget: React.FC = () => {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .is('end_time', null)
          .order('start_time', { ascending: false })
          .limit(1);

        if (error) throw error;
        setCurrentEntry(data?.[0] || null);
      } catch (error) {
        console.error('Fehler beim Laden des Zeiterfassung Status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStatus();
  }, []);

  const getElapsedTime = () => {
    if (!currentEntry) return '00:00:00';
    
    const start = new Date(currentEntry.start_time);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Zeiterfassung Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Zeiterfassung Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentEntry ? (
          <>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Aktiv</span>
            </div>
            <div className="text-2xl font-mono font-bold">
              {getElapsedTime()}
            </div>
            {currentEntry.project && (
              <p className="text-sm text-muted-foreground">
                Projekt: {currentEntry.project}
              </p>
            )}
            {currentEntry.description && (
              <p className="text-xs text-muted-foreground">
                {currentEntry.description}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Nicht aktiv</span>
            </div>
            <div className="text-2xl font-mono font-bold text-muted-foreground">
              00:00:00
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const WeeklyHoursWidget: React.FC = () => {
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyHours = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

        const { data, error } = await supabase
          .from('time_entries')
          .select('start_time, end_time, break_minutes')
          .eq('user_id', user.id)
          .gte('start_time', weekStart.toISOString())
          .lte('start_time', weekEnd.toISOString())
          .not('end_time', 'is', null);

        if (error) throw error;

        const totalMinutes = data?.reduce((total, entry) => {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60);
          const breakMinutes = entry.break_minutes || 0;
          return total + duration - breakMinutes;
        }, 0) || 0;

        setWeeklyHours(totalMinutes / 60);
      } catch (error) {
        console.error('Fehler beim Laden der Wochenstunden:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyHours();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Wochenstunden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const targetHours = 40;
  const percentage = Math.min((weeklyHours / targetHours) * 100, 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Wochenstunden
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">
          {weeklyHours.toFixed(1)}h
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Fortschritt</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ziel: {targetHours}h / Woche
        </p>
      </CardContent>
    </Card>
  );
};