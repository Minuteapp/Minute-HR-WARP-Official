
import { useState } from 'react';
import { CalendarEvent, CalendarViewType } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export const useCalendarUI = () => {
  const [view, setView] = useState<CalendarViewType>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    meeting: true,
    personal: true,
    appointment: true,
  });

  const { toast: uiToast } = useToast();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('day');
    uiToast({
      title: "Ansicht geändert",
      description: "Tag wurde ausgewählt",
    });
  };

  return {
    view,
    setView,
    selectedEvent,
    setSelectedEvent,
    selectedDate,
    setSelectedDate,
    showNewEventDialog,
    setShowNewEventDialog,
    showSettings,
    setShowSettings,
    showAIDialog,
    setShowAIDialog,
    selectedTypes,
    setSelectedTypes,
    handleDateSelect
  };
};
