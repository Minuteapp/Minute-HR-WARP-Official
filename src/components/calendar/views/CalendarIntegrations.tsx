
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarTasksWidget } from './task-integration/CalendarTasksWidget';
import { CalendarEvent } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';

export function CalendarIntegrations() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lade zukünftige Kalenderereignisse
  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gt('start', now)
        .not('type', 'eq', 'task') // Keine Aufgaben-Events
        .order('start', { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Kalenderereignisse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Kalenderintegrationen</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CalendarTasksWidget 
          upcomingEvents={upcomingEvents} 
          onSyncComplete={fetchUpcomingEvents}
        />
      </div>
    </div>
  );
}
