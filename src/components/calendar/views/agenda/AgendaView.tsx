
import React, { useMemo } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterAndSortEvents, formatDateHeader, formatEventTime, getEventColor, getEventStatusIcon, groupEventsByDate } from './utils';
import { LucideIcon } from 'lucide-react';

interface AgendaViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onNewEvent?: () => void;
  getEventIcon: (type: string) => React.ReactNode;
}

const AgendaView: React.FC<AgendaViewProps> = ({
  date,
  events,
  onEventClick,
  onNewEvent,
  getEventIcon
}) => {
  const filteredEvents = useMemo(() => filterAndSortEvents(events, date), [events, date]);
  const groupedEvents = useMemo(() => groupEventsByDate(filteredEvents), [filteredEvents]);
  
  const dateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6 p-4">
      {dateKeys.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-500 mb-4">Keine Termine im ausgewählten Zeitraum vorhanden.</p>
          {onNewEvent && (
            <Button onClick={onNewEvent}>
              Termin erstellen
            </Button>
          )}
        </div>
      ) : (
        dateKeys.map(dateKey => (
          <Card key={dateKey} className="overflow-hidden">
            <CardHeader className="bg-gray-50 py-3 px-6">
              <CardTitle className="text-base font-medium">
                {formatDateHeader(dateKey)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {groupedEvents[dateKey].map((event, index) => {
                const isLastItem = index === groupedEvents[dateKey].length - 1;
                return (
                  <div
                    key={event.id}
                    className={`flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !isLastItem ? 'border-b border-gray-100' : ''
                    }`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex-shrink-0 w-12 text-sm text-gray-500">
                      {formatEventTime(event)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {getEventIcon(event.type)}
                          <span className="font-medium ml-2">{event.title}</span>
                        </div>
                        {getEventStatusIcon(event)}
                      </div>
                      {event.location && (
                        <div className="text-sm text-gray-500 mt-1">
                          {event.location}
                        </div>
                      )}
                    </div>
                    <div className={`flex-shrink-0 ml-4 px-2 py-1 text-xs rounded-full ${getEventColor(event.type)}`}>
                      {event.type === 'meeting' ? 'Besprechung' : 
                       event.type === 'call' ? 'Anruf' :
                       event.type === 'appointment' ? 'Termin' :
                       event.type === 'interview' ? 'Interview' :
                       event.type === 'training' ? 'Training' :
                       event.type === 'task' ? 'Aufgabe' :
                       event.type === 'deadline' ? 'Frist' :
                       event.type}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AgendaView;
