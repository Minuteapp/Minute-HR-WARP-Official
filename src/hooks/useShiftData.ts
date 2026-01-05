import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Employee, Shift, ShiftType } from '@/types/shift-planning';

interface UseShiftDataReturn {
  employees: Employee[];
  shiftTypes: ShiftType[];
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  refreshShifts: (startDate?: Date, endDate?: Date) => Promise<void>;
  createShift: (shiftData: Partial<Shift>) => Promise<Shift | null>;
  updateShift: (shiftId: string, updates: Partial<Shift>) => Promise<boolean>;
  deleteShift: (shiftId: string) => Promise<boolean>;
  createShiftType: (shiftTypeData: Partial<ShiftType>) => Promise<ShiftType | null>;
  updateShiftType: (shiftTypeId: string, updates: Partial<ShiftType>) => Promise<boolean>;
}

/**
 * Zentraler Hook für alle Schichtplanungsdaten
 * Stellt sicher, dass alle Module synchron bleiben
 */
export const useShiftData = (autoLoadShifts: boolean = true): UseShiftDataReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mitarbeiter laden
  const loadEmployees = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Mitarbeiter:', err);
      throw err;
    }
  }, []);

  // Schichttypen laden
  const loadShiftTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setShiftTypes(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Schichttypen:', err);
      throw err;
    }
  }, []);

  // Schichten laden
  const loadShifts = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          shift_types(name, color),
          employees(name, department)
        `)
        .order('date');

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setShifts(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Schichten:', err);
      throw err;
    }
  }, []);

  // Alle Daten laden
  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadEmployees(),
        loadShiftTypes(),
        autoLoadShifts ? loadShifts() : Promise.resolve()
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      toast.error('Fehler beim Laden der Daten: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadEmployees, loadShiftTypes, loadShifts, autoLoadShifts]);

  // Nur Schichten neu laden
  const refreshShifts = useCallback(async (startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    try {
      await loadShifts(startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(errorMessage);
      toast.error('Fehler beim Laden der Schichten: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loadShifts]);

  // Neue Schicht erstellen
  const createShift = useCallback(async (shiftData: any): Promise<Shift | null> => {
    try {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        toast.error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
        return null;
      }

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          shift_type_id: shiftData.type,
          employee_id: shiftData.employeeId,
          date: shiftData.date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          status: shiftData.status,
          notes: shiftData.notes,
          company_id: companyId
        })
        .select(`
          *,
          shift_types(name, color),
          employees(name, department)
        `)
        .single();
      
      if (error) throw error;
      
      // Lokales Update
      setShifts(prev => [...prev, data]);
      toast.success('Schicht erfolgreich erstellt');
      return data;
    } catch (err) {
      console.error('Fehler beim Erstellen der Schicht:', err);
      toast.error('Fehler beim Erstellen der Schicht');
      return null;
    }
  }, []);

  // Schicht aktualisieren
  const updateShift = useCallback(async (shiftId: string, updates: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shifts')
        .update({
          employee_id: updates.employeeId,
          date: updates.date
        })
        .eq('id', shiftId);
      
      if (error) throw error;
      
      // Lokales Update
      setShifts(prev => prev.map(shift => 
        shift.id === shiftId ? { ...shift, ...updates } : shift
      ));
      
      return true;
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Schicht:', err);
      toast.error('Fehler beim Aktualisieren der Schicht');
      return false;
    }
  }, []);

  // Schicht löschen
  const deleteShift = useCallback(async (shiftId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);
      
      if (error) throw error;
      
      // Lokales Update
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      toast.success('Schicht erfolgreich gelöscht');
      return true;
    } catch (err) {
      console.error('Fehler beim Löschen der Schicht:', err);
      toast.error('Fehler beim Löschen der Schicht');
      return false;
    }
  }, []);

  // Neuen Schichttyp erstellen
  const createShiftType = useCallback(async (shiftTypeData: Partial<ShiftType>): Promise<ShiftType | null> => {
    try {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        toast.error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
        return null;
      }

      const { data, error } = await supabase
        .from('shift_types')
        .insert({ ...shiftTypeData, company_id: companyId })
        .select()
        .single();
      
      if (error) throw error;
      
      // Lokales Update
      setShiftTypes(prev => [...prev, data]);
      toast.success('Schichttyp erfolgreich erstellt');
      return data;
    } catch (err) {
      console.error('Fehler beim Erstellen des Schichttyps:', err);
      toast.error('Fehler beim Erstellen des Schichttyps');
      return null;
    }
  }, []);

  // Schichttyp aktualisieren
  const updateShiftType = useCallback(async (shiftTypeId: string, updates: Partial<ShiftType>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shift_types')
        .update(updates)
        .eq('id', shiftTypeId);
      
      if (error) throw error;
      
      // Lokales Update
      setShiftTypes(prev => prev.map(type => 
        type.id === shiftTypeId ? { ...type, ...updates } : type
      ));
      
      toast.success('Schichttyp erfolgreich aktualisiert');
      return true;
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Schichttyps:', err);
      toast.error('Fehler beim Aktualisieren des Schichttyps');
      return false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, []);

  // Realtime-Updates für alle Tabellen
  useEffect(() => {
    const shiftsChannel = supabase
      .channel('shifts-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        // Schichten neu laden bei Änderungen
        loadShifts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shift_types' }, () => {
        // Schichttypen neu laden bei Änderungen
        loadShiftTypes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        // Mitarbeiter neu laden bei Änderungen
        loadEmployees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(shiftsChannel);
    };
  }, [loadShifts, loadShiftTypes, loadEmployees]);

  return {
    employees,
    shiftTypes,
    shifts,
    isLoading,
    error,
    refreshAll,
    refreshShifts,
    createShift,
    updateShift,
    deleteShift,
    createShiftType,
    updateShiftType,
  };
};