import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  Square,
  Calendar,
  User,
  Timer,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProjectTimeTrackingProps {
  projectId: string;
  projectName: string;
}

export const ProjectTimeTracking: React.FC<ProjectTimeTrackingProps> = ({
  projectId,
  projectName
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const today = new Date();

  // Echte Zeiteinträge aus der Datenbank laden
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['time-entries', projectId],
    queryFn: async () => {
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          start_time,
          end_time,
          duration_minutes,
          notes,
          employee:employees(first_name, last_name)
        `)
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(entry => {
        const startDate = new Date(entry.start_time);
        const endDate = entry.end_time ? new Date(entry.end_time) : null;
        const durationMinutes = entry.duration_minutes || 0;
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        const employeeData = entry.employee as unknown as { first_name: string | null; last_name: string | null } | null;
        
        return {
          id: entry.id,
          user: employeeData 
            ? `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim() 
            : 'Unbekannt',
          startTime: format(startDate, 'HH:mm'),
          endTime: endDate ? format(endDate, 'HH:mm') : 'Laufend',
          duration: `${hours}h ${minutes}m`,
          task: entry.notes || 'Keine Beschreibung',
          date: format(startDate, 'yyyy-MM-dd')
        };
      });
    }
  });

  // Wöchentliche Statistiken laden
  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-time-stats'],
    queryFn: async () => {
      const weekStart = startOfWeek(today, { locale: de }).toISOString();
      const weekEnd = endOfWeek(today, { locale: de }).toISOString();
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .gte('start_time', weekStart)
        .lte('start_time', weekEnd);
      
      if (error) throw error;
      
      const totalMinutes = (data || []).reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
      return totalMinutes / 60; // In Stunden
    }
  });

  const totalHours = timeEntries.reduce((total, entry) => {
    const match = entry.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return total + parseInt(match[1]) + parseInt(match[2]) / 60;
    }
    return total;
  }, 0);

  const handleStartStop = () => {
    setIsTracking(!isTracking);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zeiterfassungs-Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heute erfasst</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Sessions</p>
                <p className="text-2xl font-bold">{isTracking ? 1 : 0}</p>
              </div>
              <Timer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Einträge heute</p>
                <p className="text-2xl font-bold">{timeEntries.length}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Woche gesamt</p>
                <p className="text-2xl font-bold">{(weeklyStats || 0).toFixed(1)}h</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktuelle Zeiterfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Aktuelle Zeiterfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">{projectName}</h3>
              <p className="text-sm text-muted-foreground">Projekt-Zeiterfassung</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">{currentTime}</p>
                <p className="text-sm text-muted-foreground">
                  {isTracking ? 'Läuft...' : 'Nicht aktiv'}
                </p>
              </div>
              <Button 
                onClick={handleStartStop}
                variant={isTracking ? "destructive" : "default"}
                size="lg"
              >
                {isTracking ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stoppen
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Starten
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zeiteinträge */}
      <Card>
        <CardHeader>
          <CardTitle>Heutige Zeiteinträge</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Zeiteinträge für heute gefunden
            </p>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{entry.task}</h3>
                      <p className="text-sm text-muted-foreground">{entry.user}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.duration}</p>
                    <p className="text-sm text-muted-foreground">{entry.startTime} - {entry.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zeiterfassungs-Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt-Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Geplante Stunden: 160h</span>
              <span className="font-medium">Erfasst: {totalHours.toFixed(1)}h</span>
            </div>
            <Progress value={(totalHours / 160) * 100} className="w-full" />
            
            <div className="flex justify-between items-center">
              <span>Wöchentliches Ziel: 40h</span>
              <span className="font-medium">Diese Woche: {(weeklyStats || 0).toFixed(1)}h</span>
            </div>
            <Progress value={((weeklyStats || 0) / 40) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
