import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const useCalendarExport = () => {
  const { toast } = useToast();

  const exportToCSV = (events: CalendarEvent[], dateRange?: { start: Date; end: Date }) => {
    const headers = [
      'Datum',
      'Startzeit',
      'Endzeit',
      'Titel',
      'Typ',
      'Teilnehmer',
      'Beschreibung',
      'Ganztägig'
    ];

    const csvData = events.map(event => [
      format(new Date(event.start), 'dd.MM.yyyy', { locale: de }),
      event.isAllDay ? 'Ganztägig' : format(new Date(event.start), 'HH:mm'),
      event.isAllDay ? 'Ganztägig' : format(new Date(event.end), 'HH:mm'),
      event.title || '',
      event.type || '',
      event.participants ? event.participants.join(', ') : '',
      event.description || '',
      event.isAllDay ? 'Ja' : 'Nein'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const fileName = dateRange 
      ? `kalender_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.csv`
      : `kalender_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export erfolgreich",
      description: "Kalender wurde als CSV-Datei heruntergeladen.",
    });
  };

  const exportToPDF = async (events: CalendarEvent[], dateRange?: { start: Date; end: Date }) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Kalender Export', 20, 20);
      
      if (dateRange) {
        doc.setFontSize(12);
        doc.text(
          `Zeitraum: ${format(dateRange.start, 'dd.MM.yyyy', { locale: de })} - ${format(dateRange.end, 'dd.MM.yyyy', { locale: de })}`, 
          20, 35
        );
      }
      
      doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, 20, 45);

      // Tabelle
      const tableData = events.map(event => [
        format(new Date(event.start), 'dd.MM.yyyy'),
        event.isAllDay ? 'Ganztägig' : format(new Date(event.start), 'HH:mm'),
        event.isAllDay ? 'Ganztägig' : format(new Date(event.end), 'HH:mm'),
        event.title || '',
        event.type || '',
        event.participants ? event.participants.slice(0, 2).join(', ') + (event.participants.length > 2 ? '...' : '') : ''
      ]);

      autoTable(doc, {
        head: [['Datum', 'Start', 'Ende', 'Titel', 'Typ', 'Teilnehmer']],
        body: tableData,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        columnStyles: {
          3: { cellWidth: 40 }, // Titel breiter
          5: { cellWidth: 30 }  // Teilnehmer schmaler
        }
      });

      // Statistiken
      const eventsByType = events.reduce((acc, event) => {
        const type = event.type || 'Sonstige';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.text('Zusammenfassung:', 20, finalY);
      doc.setFontSize(10);
      doc.text(`Gesamtanzahl Termine: ${events.length}`, 20, finalY + 10);
      
      // Event-Typen auflistung
      let yPosition = finalY + 20;
      Object.entries(eventsByType).forEach(([type, count]) => {
        doc.text(`${type}: ${count}`, 20, yPosition);
        yPosition += 8;
      });

      const fileName = dateRange 
        ? `kalender_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.pdf`
        : `kalender_export_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      doc.save(fileName);

      toast({
        title: "Export erfolgreich",
        description: "Kalender wurde als PDF-Datei heruntergeladen.",
      });
    } catch (error) {
      console.error('PDF Export error:', error);
      toast({
        variant: "destructive",
        title: "Export fehlgeschlagen",
        description: "PDF konnte nicht erstellt werden.",
      });
    }
  };

  const exportToICS = (events: CalendarEvent[]) => {
    const formatICSDate = (date: Date, isAllDay: boolean = false) => {
      if (isAllDay) {
        return format(date, 'yyyyMMdd');
      }
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HR System//Calendar Export//DE',
      ...events.flatMap(event => [
        'BEGIN:VEVENT',
        `UID:${event.id}@hr-system.local`,
        `DTSTART${event.isAllDay ? ';VALUE=DATE' : ''}:${formatICSDate(new Date(event.start), event.isAllDay)}`,
        `DTEND${event.isAllDay ? ';VALUE=DATE' : ''}:${formatICSDate(new Date(event.end), event.isAllDay)}`,
        `SUMMARY:${event.title || ''}`,
        ...(event.description ? [`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`] : []),
        ...(event.participants && event.participants.length > 0 ? [`ATTENDEE:${event.participants.join(',')}`] : []),
        `CATEGORIES:${event.type || 'MEETING'}`,
        `CREATED:${formatICSDate(new Date())}`,
        'END:VEVENT'
      ]),
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `kalender_export_${format(new Date(), 'yyyy-MM-dd')}.ics`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export erfolgreich",
      description: "Kalender wurde als ICS-Datei heruntergeladen.",
    });
  };

  return {
    exportToCSV,
    exportToPDF,
    exportToICS
  };
};