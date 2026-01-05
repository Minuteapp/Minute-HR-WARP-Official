import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { TimeEntry } from "@/types/time-tracking.types";
import { timeTrackingService } from "@/services/timeTrackingService";
import { format, parse, isValid } from "date-fns";

export interface ImportEntry {
  row: number;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  project: string;
  location: string;
  note: string;
  isValid: boolean;
  errors: string[];
}

export const useTimeImport = () => {
  const { toast } = useToast();
  const [importData, setImportData] = useState<ImportEntry[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const generateTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    // Beispieldaten mit Beschreibungen
    const templateData = [
      ['Datum', 'Startzeit', 'Endzeit', 'Pause (min)', 'Projekt', 'Ort', 'Notiz'],
      ['Format:', 'DD.MM.YYYY', 'HH:MM', 'HH:MM', 'Zahl', 'Text', 'office/home/mobile', 'Text'],
      ['Beispiel:', '01.01.2025', '09:00', '17:00', '30', 'Website Redesign', 'office', 'Frontend-Entwicklung'],
      ['', '', '', '', '', '', ''],
      ['02.01.2025', '08:30', '16:30', '45', 'Mobile App', 'home', 'Backend API Integration']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Spaltenbreiten setzen
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Zeiteinträge');
    XLSX.writeFile(workbook, 'zeiterfassung_vorlage.xlsx');

    toast({
      title: "Template erstellt",
      description: "Excel-Vorlage wurde heruntergeladen.",
    });
  };

  const parseExcelFile = async (file: File): Promise<ImportEntry[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          // Überspringe Header-Zeilen (erste 3 Zeilen)
          const entries: ImportEntry[] = [];
          
          for (let i = 3; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row[0]) continue; // Überspringe leere Zeilen

            const entry: ImportEntry = {
              row: i + 1,
              date: row[0]?.toString() || '',
              startTime: row[1]?.toString() || '',
              endTime: row[2]?.toString() || '',
              breakMinutes: parseInt(row[3]?.toString() || '0'),
              project: row[4]?.toString() || '',
              location: row[5]?.toString() || 'office',
              note: row[6]?.toString() || '',
              isValid: true,
              errors: []
            };

            entries.push(entry);
          }

          resolve(entries);
        } catch (error) {
          reject(new Error('Excel-Datei konnte nicht gelesen werden'));
        }
      };

      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateEntry = (entry: ImportEntry): ImportEntry => {
    const errors: string[] = [];

    // Datum validieren
    try {
      const dateFormats = ['dd.MM.yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'];
      let validDate = false;
      
      for (const fmt of dateFormats) {
        const parsed = parse(entry.date, fmt, new Date());
        if (isValid(parsed)) {
          validDate = true;
          break;
        }
      }
      
      if (!validDate) {
        errors.push('Ungültiges Datumsformat (erwartet: DD.MM.YYYY)');
      }
    } catch {
      errors.push('Datum konnte nicht geparst werden');
    }

    // Zeit validieren
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(entry.startTime)) {
      errors.push('Ungültige Startzeit (erwartet: HH:MM)');
    }
    if (!timeRegex.test(entry.endTime)) {
      errors.push('Ungültige Endzeit (erwartet: HH:MM)');
    }

    // Startzeit < Endzeit prüfen
    if (timeRegex.test(entry.startTime) && timeRegex.test(entry.endTime)) {
      const [startH, startM] = entry.startTime.split(':').map(Number);
      const [endH, endM] = entry.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      if (startMinutes >= endMinutes) {
        errors.push('Startzeit muss vor Endzeit liegen');
      }
    }

    // Pause validieren
    if (isNaN(entry.breakMinutes) || entry.breakMinutes < 0) {
      errors.push('Pausenzeit muss eine positive Zahl sein');
    }

    // Standort validieren
    if (!['office', 'home', 'mobile'].includes(entry.location.toLowerCase())) {
      errors.push('Ort muss office, home oder mobile sein');
    }

    return {
      ...entry,
      isValid: errors.length === 0,
      errors
    };
  };

  const importFromExcel = async (file: File) => {
    try {
      setIsImporting(true);
      const entries = await parseExcelFile(file);
      const validatedEntries = entries.map(validateEntry);
      
      setImportData(validatedEntries);
      
      const validCount = validatedEntries.filter(e => e.isValid).length;
      const invalidCount = validatedEntries.length - validCount;

      toast({
        title: "Datei eingelesen",
        description: `${validCount} gültige und ${invalidCount} ungültige Einträge gefunden.`,
      });

      return validatedEntries;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import fehlgeschlagen",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
      return [];
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = async (entries: ImportEntry[], userId: string) => {
    setIsImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const entry of entries) {
        if (!entry.isValid) continue;

        try {
          // Datum und Zeit kombinieren
          const date = parse(entry.date, 'dd.MM.yyyy', new Date());
          const [startH, startM] = entry.startTime.split(':').map(Number);
          const [endH, endM] = entry.endTime.split(':').map(Number);

          const startDateTime = new Date(date);
          startDateTime.setHours(startH, startM, 0, 0);

          const endDateTime = new Date(date);
          endDateTime.setHours(endH, endM, 0, 0);

          await timeTrackingService.createManualTimeEntry({
            user_id: userId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            project: entry.project || undefined,
            location: entry.location.toLowerCase(),
            note: entry.note || undefined
          });

          successCount++;
        } catch (error) {
          console.error('Fehler beim Importieren von Zeile', entry.row, error);
          failCount++;
        }
      }

      toast({
        title: "Import abgeschlossen",
        description: `${successCount} Einträge erfolgreich importiert${failCount > 0 ? `, ${failCount} fehlgeschlagen` : ''}.`,
      });

      setImportData([]);
      return { successCount, failCount };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import fehlgeschlagen",
        description: "Ein Fehler ist beim Import aufgetreten.",
      });
      return { successCount, failCount };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFromExcel,
    confirmImport,
    generateTemplate,
    importData,
    isImporting
  };
};
