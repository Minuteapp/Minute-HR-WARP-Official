
import { Card } from "@/components/ui/card";
import { Clock, Timer, Calendar, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timeTrackingService } from '@/services/timeTrackingService';
import { startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from "@/types/time-tracking.types";

const TimeStats = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const { data: todayEntries = [] } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: timeTrackingService.getTodayTimeEntries,
    refetchInterval: 1000
  });

  const { data: weekEntries = [] } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: timeTrackingService.getWeekTimeEntries,
    refetchInterval: 1000
  });

  const { data: activeEntry } = useQuery({
    queryKey: ['activeTimeEntry'],
    queryFn: timeTrackingService.getActiveTimeEntry,
    refetchInterval: 1000
  });

  const calculateTotalTime = (entries: TimeEntry[]) => {
    if (!entries || entries.length === 0) return "0:00";
    
    let totalSeconds = 0;
    
    entries.forEach(entry => {
      const start = new Date(entry.start_time).getTime();
      let end: number;
      
      // Wenn der Eintrag aktiv ist (kein end_time), verwende die aktuelle Zeit
      if (!entry.end_time && (entry.status === 'active' || entry.status === 'pending')) {
        end = Date.now();
      } else if (entry.end_time) {
        end = new Date(entry.end_time).getTime();
      } else {
        // Überspringe Einträge ohne gültiges Ende
        return;
      }
      
      // Berechne die Differenz in Sekunden
      const durationSeconds = Math.floor((end - start) / 1000);
      
      // Ziehe Pausenzeit ab (break_minutes wird in Minuten gespeichert)
      const breakSeconds = (entry.break_minutes || 0) * 60;
      const workSeconds = Math.max(0, durationSeconds - breakSeconds);
      
      totalSeconds += workSeconds;
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (!activeEntry) return "Offline";
    
    const entry = activeEntry as TimeEntry;
    // Prüfe ob der Eintrag wirklich aktiv ist
    if (entry.status === 'active') {
      switch(entry.location) {
        case 'office':
          return "Im Büro";
        case 'home':
          return "Home Office";
        case 'mobile':
          return "Unterwegs";
        default:
          return "Im Büro";
      }
    } else if (entry.status === 'pending') {
      return "Pausiert";
    } else {
      return "Offline";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 border-[#33C3F0] bg-[#33C3F0]/5">
        <div className="flex flex-col items-center space-y-2">
          <Clock className="h-8 w-8 text-[#33C3F0]" />
          <h3 className="text-lg font-semibold">Aktuelle Zeit</h3>
          <p className="text-3xl font-bold">
            {currentTime.toLocaleTimeString('de-DE')}
          </p>
        </div>
      </Card>

      <Card className="p-4 border-[#33C3F0] bg-[#33C3F0]/5">
        <div className="flex flex-col items-center space-y-2">
          <Timer className="h-8 w-8 text-[#33C3F0]" />
          <h3 className="text-lg font-semibold">Arbeitszeit Heute</h3>
          <p className="text-3xl font-bold">{calculateTotalTime(todayEntries)}</p>
        </div>
      </Card>

      <Card className="p-4 border-[#33C3F0] bg-[#33C3F0]/5">
        <div className="flex flex-col items-center space-y-2">
          <Calendar className="h-8 w-8 text-[#33C3F0]" />
          <h3 className="text-lg font-semibold">Diese Woche</h3>
          <p className="text-3xl font-bold">{calculateTotalTime(weekEntries)}</p>
        </div>
      </Card>

      <Card className="p-4 border-[#33C3F0] bg-[#33C3F0]/5">
        <div className="flex flex-col items-center space-y-2">
          <Settings className="h-8 w-8 text-[#33C3F0]" />
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-3xl font-bold">{getStatus()}</p>
        </div>
      </Card>
    </div>
  );
};

export default TimeStats;
