
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, Settings, Bot } from 'lucide-react';
import { CalendarViewType } from '@/types/calendar';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import CalendarContent from './CalendarContent';
import CalendarViewSelector from './CalendarViewSelector';
import NewEventDialog from './NewEventDialog';
import EventSettingsDialog from './EventSettingsDialog';
import EventAIDialog from './EventAIDialog';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessCalendarView = () => {
  const {
    events,
    selectedEvent,
    selectedDate,
    view,
    showNewEventDialog,
    isLoading,
    setView,
    setShowNewEventDialog,
    handleEventClick,
    handleDateSelect,
    handleCreateEvent
  } = useCalendar();

  const [showSettings, setShowSettings] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    meeting: true,
    personal: true,
    appointment: true,
    training: true,
    holiday: true
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    type: 'other', // Standard auf "Sonstiges" setzen
    color: 'blue',
    participants: [],
    isAllDay: false,
    location: '',
    description: ''
  });

  const handleNewEventChange = (eventData: any) => {
    setNewEvent({
      ...newEvent,
      ...eventData,
      // Sicherstellen, dass color immer einen Wert hat
      color: eventData.color || newEvent.color || 'blue'
    });
  };

  const handleSaveNewEvent = async () => {
    try {
      await handleCreateEvent(newEvent);
      // Event wird in useCalendar zurückgesetzt
      setNewEvent({
        title: '',
        start: new Date().toISOString(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        type: 'other', // Standard auf "Sonstiges" setzen
        color: 'blue',
        participants: [],
        isAllDay: false,
        location: '',
        description: ''
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="border-[#3B44F6]/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
            <CalendarIcon className="h-6 w-6 text-[#3B44F6]" />
            Kalender
          </CardTitle>
          <div className="flex items-center gap-2">
            <CalendarViewSelector view={view} onViewChange={setView} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIDialog(true)}
              className="border-[#3B44F6]/40 hover:bg-[#3B44F6]/5"
            >
              <Bot className="h-4 w-4 mr-2" />
              KI-Assistent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="border-[#3B44F6]/40 hover:bg-[#3B44F6]/5"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowNewEventDialog(true)}
              className="bg-[#3B44F6] hover:bg-[#3B44F6]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuer Termin
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CalendarContent
            view={view}
            events={events}
            onEventClick={handleEventClick}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            selectedTypes={selectedTypes}
            isLoading={false}
          />
        </CardContent>
      </Card>

      <NewEventDialog
        isOpen={showNewEventDialog}
        onClose={() => setShowNewEventDialog(false)}
        newEvent={newEvent}
        onNewEventChange={handleNewEventChange}
        onSave={handleSaveNewEvent}
      />

      <EventSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />

      <EventAIDialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
      />
    </div>
  );
};

export default BusinessCalendarView;
