
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShiftDetailDialog from './ShiftDetailDialog';
import ShiftManagementDialog from './ShiftManagementDialog';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import { Shift } from '@/types/shift-planning';
import { toast } from 'sonner';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { de },
});

const ShiftPlanningCalendar = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Lade Schichten beim Start und bei Datumsänderung
  useEffect(() => {
    loadShifts();
  }, [currentDate]);

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      // Lade Schichten für den aktuellen Monat
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const shiftsData = await shiftPlanningService.getShifts(startOfMonth, endOfMonth);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Fehler beim Laden der Schichten:', error);
      toast.error('Fehler beim Laden der Schichten');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatische Schichtzuweisung
  const handleAutoAssign = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const result = await shiftPlanningService.autoAssignShifts(startOfMonth, endOfMonth);
      
      if (result.success) {
        toast.success(`${result.assigned} Schichten automatisch zugewiesen`);
        if (result.conflicts.length > 0) {
          console.warn('Konflikte bei der Zuweisung:', result.conflicts);
        }
        loadShifts(); // Neu laden nach Zuweisung
      } else {
        toast.error('Fehler bei der automatischen Zuweisung');
        result.conflicts.forEach(conflict => {
          console.error('Konflikt:', conflict);
        });
      }
    } catch (error) {
      console.error('Fehler bei der automatischen Zuweisung:', error);
      toast.error('Fehler bei der automatischen Zuweisung');
    } finally {
      setIsLoading(false);
    }
  };

  // Konvertiere Schichten zu Kalender-Events
  const events = shifts.map(shift => ({
    id: shift.id,
    title: `${shift.employeeName} - ${shift.type}`,
    start: new Date(shift.date + 'T' + (shift.start_time || '08:00')),
    end: new Date(shift.date + 'T' + (shift.end_time || '16:00')),
    resource: shift
  }));

  const handleEventClick = (event: any) => {
    setSelectedShift(event.resource);
    setIsDetailDialogOpen(true);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setIsManagementDialogOpen(true);
  };

  const handleShiftCreated = () => {
    loadShifts();
    setIsManagementDialogOpen(false);
  };

  const getEventStyle = (event: any) => {
    const shift = event.resource as Shift;
    let backgroundColor = '#3174ad';
    
    switch (shift.status) {
      case 'confirmed':
        backgroundColor = '#22c55e';
        break;
      case 'conflict':
        backgroundColor = '#ef4444';
        break;
      case 'scheduled':
        backgroundColor = '#3b82f6';
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Schichtkalender
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={loadShifts} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
              <Button 
                onClick={handleAutoAssign} 
                variant="secondary" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-Zuweisung
              </Button>
              <Button onClick={() => setIsManagementDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neue Schicht
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status-Legende */}
          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Geplant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Bestätigt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">Konflikt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-sm">Sonstige</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleEventClick}
                onSelectSlot={handleSelectSlot}
                selectable={true}
                eventPropGetter={getEventStyle}
                views={['month', 'week', 'day']}
                defaultView="month"
                culture="de"
                messages={{
                  next: 'Weiter',
                  previous: 'Zurück',
                  today: 'Heute',
                  month: 'Monat',
                  week: 'Woche',
                  day: 'Tag',
                  agenda: 'Agenda',
                  date: 'Datum',
                  time: 'Zeit',
                  event: 'Ereignis',
                  noEventsInRange: 'Keine Schichten in diesem Zeitraum',
                  showMore: (total) => `+ ${total} weitere`
                }}
                formats={{
                  monthHeaderFormat: 'MMMM yyyy',
                  dayHeaderFormat: 'dddd, d. MMMM yyyy',
                  dayRangeHeaderFormat: ({ start, end }) =>
                    `${format(start, 'd. MMM', { locale: de })} - ${format(end, 'd. MMM yyyy', { locale: de })}`,
                }}
                onNavigate={(date) => setCurrentDate(date)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schicht-Detail Dialog */}
      <ShiftDetailDialog
        shift={selectedShift}
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onShiftUpdated={loadShifts}
      />

      {/* Schicht-Management Dialog */}
      <ShiftManagementDialog
        isOpen={isManagementDialogOpen}
        onOpenChange={setIsManagementDialogOpen}
        onShiftCreated={handleShiftCreated}
      />
    </div>
  );
};

export default ShiftPlanningCalendar;
