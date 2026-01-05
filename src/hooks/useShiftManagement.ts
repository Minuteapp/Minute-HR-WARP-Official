
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { Shift } from '@/types/shifts';
import type { Employee } from '@/types/shift-planning';

export const useShiftManagement = (currentDate: Date) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const mapShiftTypeIdToType = (shift_type_id: string): 'early' | 'late' | 'night' => {
    switch (shift_type_id) {
      case '1':
        return 'early';
      case '2':
        return 'late';
      case '3':
        return 'night';
      default:
        return 'early';
    }
  };

  const mapDatabaseStatus = (status: string): 'scheduled' | 'confirmed' | 'conflict' => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'conflict':
        return 'conflict';
      default:
        return 'scheduled';
    }
  };

  const fetchShifts = async () => {
    setIsLoading(true);
    const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    try {
      // Lade Mitarbeiter (Demo-Daten)
      const dummyEmployees: Employee[] = [
        {
          id: 'emp-001',
          name: 'Anna Müller',
          qualifications: ['Erste Hilfe', 'Teamleitung'],
          preferredShifts: ['früh', 'spät'],
          availableHours: { start: '06:00', end: '22:00' },
          department: 'Verkauf'
        },
        {
          id: 'emp-002',
          name: 'Thomas Weber',
          qualifications: ['Sicherheit', 'Logistik'],
          preferredShifts: ['spät', 'nacht'],
          availableHours: { start: '14:00', end: '06:00' },
          department: 'Lager'
        },
        // Weitere Dummy-Mitarbeiter, falls benötigt
      ];
      setEmployees(dummyEmployees);

      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          shift_types (
            shift_requirements (*)
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      if (error) {
        console.error('Error fetching shifts:', error);
        toast({
          title: "Fehler beim Laden der Schichten",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const formattedShifts: Shift[] = data.map(shift => ({
          id: shift.id,
          start_time: shift.start_time,
          end_time: shift.end_time,
          employee_id: shift.employee_id,
          date: shift.date,
          status: mapDatabaseStatus(shift.status),
          notes: shift.notes || '',
          type: mapShiftTypeIdToType(shift.shift_type_id),
          requirements: shift.shift_types?.shift_requirements?.map((req: any) => req.requirement_value) || []
        }));
        
        setShifts(formattedShifts);
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Daten:', error);
      toast({
        title: "Fehler beim Laden der Daten",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const hour = Math.floor(destination.index / 2);
    const minutes = (destination.index % 2) * 30;
    const newTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    try {
      const shiftToUpdate = shifts.find(s => s.id === draggableId);
      if (!shiftToUpdate) return;

      const { error } = await supabase
        .from('shifts')
        .update({
          start_time: newTime,
          date: destination.droppableId
        })
        .eq('id', draggableId);

      if (error) throw error;

      const newShifts = shifts.map(shift => {
        if (shift.id === draggableId) {
          return {
            ...shift,
            start_time: newTime,
            date: destination.droppableId
          };
        }
        return shift;
      });

      setShifts(newShifts);
      
      toast({
        title: "Schicht aktualisiert",
        description: "Die Schicht wurde erfolgreich verschoben."
      });

    } catch (error: any) {
      console.error('Error updating shift:', error);
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [currentDate]);

  return { shifts, employees, isLoading, handleDragEnd, fetchShifts };
};
