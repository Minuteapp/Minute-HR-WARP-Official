
import { CalendarEvent } from '@/types/calendar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export function useCalendarEventHandlers() {
  const handleExport = (events: CalendarEvent[]) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Kalenderexport', 14, 22);
    doc.setFontSize(11);
    doc.text(`Erstellt am: ${format(new Date(), 'd. MMMM yyyy', { locale: de })}`, 14, 30);
    
    const tableColumn = ["Titel", "Datum", "Zeit", "Typ", "Ort"];
    const tableRows = events.map(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      return [
        event.title,
        format(startDate, 'd. MMMM yyyy', { locale: de }),
        event.isAllDay 
          ? 'Ganztägig' 
          : `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`,
        event.type,
        event.location || '-'
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [100, 100, 100] }
    });
    
    doc.save('kalender-export.pdf');
    toast.success('Kalenderexport erfolgreich erstellt');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    
    // Event-Details in einem benutzerdefinierten Event übergeben
    // Dies löst die Anzeige des Detailfensters aus
    const customEvent = new CustomEvent('calendar:select-event', { 
      detail: { event } 
    });
    document.dispatchEvent(customEvent);
  };

  return {
    handleExport,
    handlePrint,
    handleEventClick
  };
}
