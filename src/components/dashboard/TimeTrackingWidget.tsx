import { Play, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { timeTrackingService } from '@/services/timeTrackingService';
import { TimeEntry } from '@/types/time-tracking.types';

const TimeTrackingWidget = () => {
  const navigate = useNavigate();
  const {
    isTracking,
    dailyWorkHours,
    weeklyWorkHours,
    isLoading,
  } = useTimeTracking();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch week entries for chart
  const { data: weekEntries = [] } = useQuery({
    queryKey: ['weekTimeEntries'],
    queryFn: timeTrackingService.getWeekTimeEntries,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Fetch today entries for pause info
  const { data: todayEntries = [] } = useQuery({
    queryKey: ['todayTimeEntries'],
    queryFn: timeTrackingService.getTodayTimeEntries,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = () => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Calculate real week data from entries
  const weekData = useMemo(() => {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);
      const dayStart = new Date(dayDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Sum up hours for this day from week entries
      const dayHours = weekEntries
        .filter((entry: TimeEntry) => {
          const entryDate = new Date(entry.start_time);
          return entryDate >= dayStart && entryDate <= dayEnd;
        })
        .reduce((total: number, entry: TimeEntry) => {
          if (!entry.end_time && entry.status !== 'active') return total;
          
          const start = new Date(entry.start_time).getTime();
          const end = entry.end_time 
            ? new Date(entry.end_time).getTime()
            : new Date().getTime();
          const breakTime = (entry.break_minutes || 0) * 60 * 1000;
          const workTime = Math.max(0, end - start - breakTime);
          
          return total + (workTime / (1000 * 60 * 60));
        }, 0);

      return {
        day,
        hours: Math.round(dayHours * 10) / 10,
        target: 8
      };
    });
  }, [weekEntries]);

  // Calculate overtime (assuming 40h work week)
  const targetWeeklyHours = 40;
  const overtime = weeklyWorkHours - targetWeeklyHours;
  const weekDifference = weeklyWorkHours - targetWeeklyHours;

  // Calculate average daily hours
  const workedDays = weekData.filter(d => d.hours > 0).length || 1;
  const averageDailyHours = weeklyWorkHours / workedDays;

  // Get today's breaks info
  const todayBreaks = useMemo(() => {
    const totalBreakMinutes = todayEntries.reduce((total: number, entry: TimeEntry) => {
      return total + (entry.break_minutes || 0);
    }, 0);

    // Find the last break
    const lastBreakEntry = [...todayEntries]
      .filter((e: TimeEntry) => e.break_minutes && e.break_minutes > 0)
      .pop();

    return {
      totalMinutes: totalBreakMinutes,
      lastBreak: lastBreakEntry ? 'Heute' : '--:--'
    };
  }, [todayEntries]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="text-gray-500 text-sm">Lädt...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-base font-semibold text-gray-700">Zeiterfassung</h2>
        <Badge className="bg-black text-white hover:bg-black text-xs">
          {isTracking ? 'Aktiv' : 'Inaktiv'}
        </Badge>
      </div>

      {/* Current Time Display */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="text-center mb-3">
          <div className="text-3xl font-bold mb-1">{formatCurrentTime()}</div>
          <div className="text-xs text-gray-600">Aktuelle Zeit</div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-blue-600">
            {String(Math.floor(dailyWorkHours)).padStart(2, '0')}:
            {String(Math.floor((dailyWorkHours % 1) * 60)).padStart(2, '0')}:00
          </div>
          <div className="text-xs text-gray-600">Heute gearbeitet</div>
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={() => navigate('/time')}
        >
          <Play className="h-4 w-4 mr-2" />
          Starten
        </Button>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Diese Woche</div>
          <div className="text-2xl font-bold mb-1">
            {weeklyWorkHours.toFixed(1)}h
          </div>
          <div className={`flex items-center text-xs ${weekDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {weekDifference >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {weekDifference >= 0 ? '+' : ''}{weekDifference.toFixed(1)}h
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Überstunden</div>
          <div className="text-2xl font-bold mb-1">
            {overtime > 0 ? `+${overtime.toFixed(1)}h` : `${overtime.toFixed(1)}h`}
          </div>
          <div className="text-xs text-blue-600">Angesammelt</div>
        </div>
      </div>

      {/* Week Chart */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Wochenverlauf</h3>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              domain={[0, 12]}
              ticks={[0, 6, 12]}
            />
            <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-3 text-xs">
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-600">Durchschnitt/Tag</span>
          <span className="font-semibold">{averageDailyHours.toFixed(2)}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pausen heute</span>
          <span className="font-semibold">{todayBreaks.totalMinutes} Min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Arbeitstage</span>
          <span className="font-semibold">{workedDays} Tage</span>
        </div>
      </div>

      {/* Report Button */}
      <Button 
        variant="outline" 
        className="w-full text-sm h-9"
        onClick={() => navigate('/time')}
      >
        Zeitbericht
      </Button>
    </Card>
  );
};

export default TimeTrackingWidget;
