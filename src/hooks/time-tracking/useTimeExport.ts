import { useToast } from "@/hooks/use-toast";
import { TimeEntry } from "@/types/time-tracking.types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useTimeExport = () => {
  const { toast } = useToast();

  const exportToCSV = (timeEntries: TimeEntry[], employeeName?: string) => {
    const formatDuration = (startTime: string, endTime: string, breakMinutes: number = 0) => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end.getTime() - start.getTime() - (breakMinutes * 60 * 1000);
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const headers = [
      'Datum',
      'Startzeit',
      'Endzeit',
      'Dauer',
      'Pause (min)',
      'Projekt',
      'Ort',
      'Status',
      'Notiz'
    ];

    const csvData = timeEntries.map(entry => [
      format(new Date(entry.start_time), 'dd.MM.yyyy', { locale: de }),
      format(new Date(entry.start_time), 'HH:mm'),
      entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '',
      entry.end_time ? formatDuration(entry.start_time, entry.end_time, entry.break_minutes) : '',
      entry.break_minutes?.toString() || '0',
      entry.project || '',
      entry.location || '',
      entry.status === 'completed' ? 'Abgeschlossen' : 
      entry.status === 'active' ? 'Aktiv' : 
      entry.status === 'pending' ? 'Ausstehend' : 'Abgebrochen',
      entry.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `zeitbericht_${employeeName || 'mitarbeiter'}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export erfolgreich",
      description: "Zeitbericht wurde als CSV-Datei heruntergeladen.",
    });
  };

  const exportToPDF = async (timeEntries: TimeEntry[], employeeName?: string) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Zeitbericht', 20, 20);
      
      if (employeeName) {
        doc.setFontSize(12);
        doc.text(`Mitarbeiter: ${employeeName}`, 20, 35);
      }
      
      doc.text(`Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`, 20, 45);

      // Tabelle
      const formatDuration = (startTime: string, endTime: string, breakMinutes: number = 0) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end.getTime() - start.getTime() - (breakMinutes * 60 * 1000);
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      };

      const tableData = timeEntries.map(entry => [
        format(new Date(entry.start_time), 'dd.MM.yyyy'),
        format(new Date(entry.start_time), 'HH:mm'),
        entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : '',
        entry.end_time ? formatDuration(entry.start_time, entry.end_time, entry.break_minutes) : '',
        entry.break_minutes?.toString() || '0',
        entry.project || '',
        entry.location || '',
        entry.status === 'completed' ? 'Abgeschlossen' : 
        entry.status === 'active' ? 'Aktiv' : 
        entry.status === 'pending' ? 'Ausstehend' : 'Abgebrochen'
      ]);

      autoTable(doc, {
        head: [['Datum', 'Start', 'Ende', 'Dauer', 'Pause', 'Projekt', 'Ort', 'Status']],
        body: tableData,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });

      // Gesamtstunden berechnen
      const totalMinutes = timeEntries.reduce((total, entry) => {
        if (!entry.end_time) return total;
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const durationMs = end.getTime() - start.getTime() - ((entry.break_minutes || 0) * 60 * 1000);
        return total + (durationMs / (1000 * 60));
      }, 0);

      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = Math.round(totalMinutes % 60);

      // Zusammenfassung
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.text(`Gesamtarbeitszeit: ${totalHours}:${remainingMinutes.toString().padStart(2, '0')} Stunden`, 20, finalY);
      doc.text(`Anzahl Einträge: ${timeEntries.length}`, 20, finalY + 10);

      doc.save(`zeitbericht_${employeeName || 'mitarbeiter'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: "Export erfolgreich",
        description: "Zeitbericht wurde als PDF-Datei heruntergeladen.",
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

  return {
    exportToCSV,
    exportToPDF
  };
};