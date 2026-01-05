import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MonthGroup } from './MonthGroup';
import { HistoryEventCard } from './HistoryEventCard';
import { History } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HistoryEventsListProps {
  employeeFilter: string;
  yearFilter: string;
  typeFilter: string;
}

export const HistoryEventsList: React.FC<HistoryEventsListProps> = ({
  employeeFilter,
  yearFilter,
  typeFilter
}) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['performance-history', employeeFilter, yearFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('performance_history')
        .select('*')
        .order('event_date', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('event_type', typeFilter);
      }

      if (yearFilter !== 'all') {
        query = query
          .gte('event_date', `${yearFilter}-01-01`)
          .lte('event_date', `${yearFilter}-12-31`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Keine Ereignisse vorhanden</h3>
        <p className="text-muted-foreground">
          Es wurden noch keine Performance-Ereignisse aufgezeichnet.
        </p>
      </div>
    );
  }

  // Group events by month
  const groupedEvents = events.reduce((acc, event) => {
    const monthKey = format(parseISO(event.event_date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([monthKey, monthEvents]) => {
        const eventsArray = monthEvents as typeof events;
        return (
          <div key={monthKey}>
            <MonthGroup monthKey={monthKey} count={eventsArray.length} />
            <div className="space-y-3 mt-2">
              {eventsArray.map(event => (
                <HistoryEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
