
import { useState } from 'react';
import { toast } from 'sonner';
import { absenceManagementService } from '@/services/absenceManagementService';

// Erweiterte Definition für einen Ersatzmitarbeiter
interface ReplacementEmployee {
  id: string;
  name: string;
  department: string;
}

// Erweiterte Shift-Struktur
interface Shift {
  id: string;
  type: string;
  date: string;
  employeeId: string;
}

export interface ShiftConflict {
  id: string;
  date: string;
  time: string;
  type: string;
  employee_id: string;
  employee_name: string;
  
  // Neue Eigenschaften, die in der ShiftConflictResolution-Komponente verwendet werden
  shift: Shift;
  replacementOptions: ReplacementEmployee[];
  replacementEmployee?: ReplacementEmployee;
  autoAssigned?: boolean;
}

export const useAbsenceShiftManagement = () => {
  const [conflicts, setConflicts] = useState<ShiftConflict[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Überprüft auf Konflikte zwischen der geplanten Abwesenheit und bestehenden Schichten
  const checkAbsenceShiftConflicts = async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ hasConflicts: boolean; conflicts: ShiftConflict[] }> => {
    setIsChecking(true);
    
    try {
      // In einer realen Implementierung würde dies eine API-Anfrage sein, um Schichtkonflikte abzurufen
      // Hier generieren wir Beispieldaten
      await new Promise(resolve => setTimeout(resolve, 800)); // Simuliere Netzwerklatenz
      
      // Prüfe, ob die angegebenen Daten auf Wochenenden fallen
      // Dies ist ein vereinfachtes Beispiel für Konflikte
      const conflicts: ShiftConflict[] = [];
      
      // Iteriere über jeden Tag zwischen Start- und Enddatum
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Wenn der Tag ein Freitag (5) oder Samstag (6) ist, füge einen Konflikt hinzu
        if (currentDate.getDay() === 5 || currentDate.getDay() === 6) {
          const shiftId = `shift-${currentDate.toISOString()}`;
          conflicts.push({
            id: shiftId,
            date: currentDate.toISOString().split('T')[0],
            time: '08:00 - 16:00',
            type: currentDate.getDay() === 5 ? 'Frühschicht' : 'Spätschicht',
            employee_id: userId,
            employee_name: 'Sie',
            shift: {
              id: shiftId,
              type: currentDate.getDay() === 5 ? '1' : '2',  // ID for shift types
              date: currentDate.toISOString().split('T')[0],
              employeeId: userId
            },
            replacementOptions: [
              { id: 'emp-001', name: 'Anna Müller', department: 'Verkauf' },
              { id: 'emp-002', name: 'Thomas Weber', department: 'Lager' },
              { id: 'emp-003', name: 'Sarah Fischer', department: 'Kundenservice' }
            ],
            replacementEmployee: undefined,
            autoAssigned: false
          });
        }
        
        // Zum nächsten Tag gehen
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setConflicts(conflicts);
      return { hasConflicts: conflicts.length > 0, conflicts };
    } catch (error) {
      console.error('Error checking shift conflicts:', error);
      toast.error('Fehler beim Prüfen auf Schichtkonflikte');
      return { hasConflicts: false, conflicts: [] };
    } finally {
      setIsChecking(false);
    }
  };

  // Einreichen einer Abwesenheitsanfrage mit Konfliktbehandlung
  const submitAbsenceWithShiftHandling = async (
    request: any,
    files: File[],
    conflictResolution: 'auto' | 'manual' | 'unplan' | null,
    manualAssignments?: Record<string, string>
  ): Promise<{ success: boolean, hadConflicts: boolean }> => {
    try {
      // 1. Erstelle den Abwesenheitsantrag
      const absenceResult = await absenceManagementService.createRequest(request);
      
      if (!absenceResult) {
        throw new Error('Fehler beim Erstellen des Abwesenheitsantrags');
      }
      
      // Wenn keine Konflikte vorhanden sind, sind wir fertig
      if (conflicts.length === 0) {
        return { success: true, hadConflicts: false };
      }
      
      // 2. Je nach gewählter Konfliktlösungsstrategie verschiedene Aktionen durchführen
      switch (conflictResolution) {
        case 'auto':
          // Automatische Neuzuweisung der Schichten
          // TODO: Implementiere API-Aufruf zur automatischen Neuzuweisung
          console.log('Automatische Neuzuweisung der Schichten:', conflicts);
          break;
          
        case 'manual':
          // Manuelle Neuzuweisung der Schichten basierend auf den bereitgestellten Zuweisungen
          if (manualAssignments) {
            console.log('Manuelle Neuzuweisung der Schichten:', manualAssignments);
            // TODO: Implementiere API-Aufruf zur manuellen Neuzuweisung
          }
          break;
          
        case 'unplan':
          // Schichten entfernen
          console.log('Schichten werden entfernt:', conflicts);
          // TODO: Implementiere API-Aufruf zum Entfernen der Schichten
          break;
          
        default:
          // Keine Aktion bei Konflikten
          console.log('Keine Aktion bei Schichtkonflikten');
      }
      
      return { success: true, hadConflicts: true };
    } catch (error) {
      console.error('Error submitting absence with shift handling:', error);
      toast.error('Fehler beim Einreichen des Antrags mit Schichtbehandlung');
      return { success: false, hadConflicts: false };
    }
  };

  return {
    conflicts,
    isChecking,
    checkAbsenceShiftConflicts,
    submitAbsenceWithShiftHandling
  };
};
