import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

const locales = {
  'de': de,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ExpenseCalendarViewProps {
  onDayClick: (day: Date) => void;
}

export const ExpenseCalendarView = ({ onDayClick }: ExpenseCalendarViewProps) => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['expense-calendar-events', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('id, description, amount, expense_date, category')
        .eq('company_id', companyId)
        .order('expense_date', { ascending: false });
      
      if (error) {
        console.log('expenses query error:', error.message);
        return [];
      }
      
      return (data || []).map(expense => ({
        id: expense.id,
        title: `${expense.description || 'Ausgabe'} - €${expense.amount?.toFixed(2) || '0.00'}`,
        start: new Date(expense.expense_date),
        end: new Date(expense.expense_date),
        resource: expense.category || 'other'
      }));
    },
    enabled: !!companyId
  });

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource) {
      case 'travel':
        backgroundColor = '#f59e0b';
        break;
      case 'office':
        backgroundColor = '#10b981';
        break;
      case 'training':
        backgroundColor = '#8b5cf6';
        break;
      default:
        backgroundColor = '#6b7280';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (isLoading) {
    return (
      <div className="h-[600px] p-4">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="h-[600px] p-4">
        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Ausgaben vorhanden</p>
          <p className="text-sm text-muted-foreground mt-1">Ausgaben werden im Kalender angezeigt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectSlot={(slotInfo) => onDayClick(slotInfo.start)}
        selectable
        messages={{
          month: 'Monat',
          week: 'Woche',
          day: 'Tag',
          agenda: 'Agenda',
          date: 'Datum',
          time: 'Zeit',
          event: 'Ereignis',
          noEventsInRange: 'Keine Ausgaben in diesem Zeitraum',
          showMore: (total) => `+ ${total} weitere`
        }}
      />
    </div>
  );
};
