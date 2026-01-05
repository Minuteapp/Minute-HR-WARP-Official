
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, Plus } from "lucide-react";
import { NewEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import MobileNewEventDialog from './MobileNewEventDialog';

const MobileCalendarDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  
  const { newEvent, setNewEvent, handleSaveNewEvent } = useCalendarEvents();
  
  const { data: events = [] } = useQuery({
    queryKey: ['mobile-calendar-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time');
        
      return data || [];
    },
  });

  // Woche generieren (7 Tage)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Events für den ausgewählten Tag
  const selectedDayEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    return isSameDay(eventDate, selectedDate);
  });

  const getEventColor = (index: number) => {
    const colors = [
      'bg-orange-100 border-l-orange-400',
      'bg-purple-100 border-l-purple-400', 
      'bg-green-100 border-l-green-400',
      'bg-pink-100 border-l-pink-400',
    ];
    return colors[index % colors.length];
  };

  const getEventIcon = (index: number) => {
    const icons = ['🧠', '👥', '📹', '🎯'];
    return icons[index % icons.length];
  };

  const handleNewEventSave = async () => {
    const success = await handleSaveNewEvent();
    if (success) {
      setShowNewEventDialog(false);
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Menu className="h-6 w-6 text-gray-600" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-900">
              {format(selectedDate, 'MMMM, yyyy', { locale: de })}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <span className="text-sm">▼</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-6 w-6 text-gray-600" />
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">Hallo Benutzer,</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Du hast <span className="text-blue-500">{selectedDayEvents.length} Termine</span>
          </h1>
          <h2 className="text-2xl font-bold text-gray-900">
            die heute auf dich warten
          </h2>
        </div>

        {/* Wochenansicht */}
        <div className="flex justify-between items-center bg-gray-100 rounded-lg p-2">
          {weekDays.map((day, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col items-center p-2 rounded-lg min-w-0 flex-1 ${
                isSameDay(day, selectedDate) 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600'
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <span className="text-xs font-medium">
                {format(day, 'dd', { locale: de })}
              </span>
              <span className="text-xs">
                {format(day, 'EEE', { locale: de })}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Event Liste */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
            {isToday(selectedDate) && ' (Heute)'}
          </h3>
          <span className="text-blue-500 text-sm font-medium">
            {selectedDayEvents.length} Termine warten
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Ganztägig</p>
            <p className="text-sm mt-2">Keine Termine für heute</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Ganztägig</p>
            
            {/* Zeit-Anzeige */}
            <div className="relative">
              {selectedDayEvents.map((event, index) => {
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);
                
                return (
                  <div key={event.id} className="flex items-start gap-4 mb-4">
                    {/* Zeit Sidebar */}
                    <div className="text-xs text-gray-500 w-12 text-right pt-1">
                      {format(startTime, 'H:mm')}
                    </div>
                    
                    {/* Event Card */}
                    <Card className={`flex-1 p-4 border-l-4 ${getEventColor(index)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getEventIcon(index)}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <p className="text-xs text-gray-600">
                              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {/* Teilnehmer Avatars */}
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((_, i) => (
                              <div 
                                key={i}
                                className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center"
                              >
                                <User className="h-3 w-3 text-gray-600" />
                              </div>
                            ))}
                            <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600">
                              +8
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowNewEventDialog(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Mobile New Event Dialog */}
      <MobileNewEventDialog
        isOpen={showNewEventDialog}
        onClose={() => setShowNewEventDialog(false)}
        newEvent={newEvent}
        onNewEventChange={setNewEvent}
        onSave={handleNewEventSave}
      />
    </div>
  );
};

export default MobileCalendarDashboard;
