import MonthView from '@/components/calendar/MonthView';
import { useCalendarPage } from '@/hooks/useCalendarPage';

const CalendarMonthView = () => {
  const { allEvents, selectedEvent, setSelectedEvent, selectedDate, setSelectedDate, handleDateSelect } = useCalendarPage();

  return (
    <MonthView 
      events={allEvents}
      onEventClick={setSelectedEvent}
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
    />
  );
};

export default CalendarMonthView;