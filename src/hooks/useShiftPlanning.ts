
import { useState, useEffect } from 'react';
import { ShiftType, Employee, Shift } from '@/types/shift-planning';
import { shiftPlanningService } from '@/services/shiftPlanningService';
import { toast } from 'sonner';

interface ReassignmentResult {
  success: boolean;
  newEmployee?: {
    id: string;
    name: string;
    department?: string;
  };
  shift?: Shift;
}

export const useShiftPlanning = () => {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadShiftTypes = async () => {
      setIsLoading(true);
      try {
        const types = await shiftPlanningService.getShiftTypes();
        setShiftTypes(types || []);
        
        const employeeData = await shiftPlanningService.getEmployees();
        setEmployees(employeeData || []);
        
        setError(null);
      } catch (error) {
        console.error("Fehler beim Laden der Schichttypen:", error);
        setError(error instanceof Error ? error : new Error("Unbekannter Fehler"));
      } finally {
        setIsLoading(false);
      }
    };

    loadShiftTypes();
  }, []);

  const fetchShifts = async (date = new Date()) => {
    setIsLoading(true);
    try {
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 31);
      const shiftsData = await shiftPlanningService.generateShiftPlan(date, endDate);
      setShifts(shiftsData.plan);
      setError(null);
    } catch (error) {
      console.error("Fehler beim Laden der Schichten:", error);
      setError(error instanceof Error ? error : new Error("Fehler beim Laden der Schichten"));
      toast.error("Fehler beim Laden der Schichten");
    } finally {
      setIsLoading(false);
    }
  };

  const createShift = async (shiftData: Partial<Shift>, employeeId?: string) => {
    setIsLoading(true);
    try {
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        type: shiftData.type || '1',
        date: shiftData.date || format(new Date(), 'yyyy-MM-dd'),
        employeeId: employeeId || '',
        status: shiftData.status || 'scheduled',
        requirements: shiftData.requirements || []
      };
      
      setShifts(prev => [...prev, newShift]);
      toast.success("Schicht erfolgreich erstellt");
      setError(null);
      return newShift;
    } catch (error) {
      console.error("Fehler beim Erstellen der Schicht:", error);
      setError(error instanceof Error ? error : new Error("Fehler beim Erstellen der Schicht"));
      toast.error("Fehler beim Erstellen der Schicht");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reassignShift = async (shiftId: string, employeeId: string): Promise<ReassignmentResult> => {
    setIsLoading(true);
    try {
      const updatedShift = await shiftPlanningService.updateShift(shiftId, { employeeId });
      
      const replacementEmployee = employees.find(emp => emp.id === employeeId);
      
      if (updatedShift) {
        setShifts(prev => prev.map(shift => 
          shift.id === shiftId ? { ...shift, employeeId } : shift
        ));
        toast.success("Schicht erfolgreich neu zugewiesen");
        
        return {
          success: true,
          newEmployee: replacementEmployee ? {
            id: replacementEmployee.id,
            name: replacementEmployee.name,
            department: replacementEmployee.department
          } : undefined,
          shift: updatedShift
        };
      }
      setError(null);
      return { success: false };
    } catch (error) {
      console.error("Fehler bei der Neuzuweisung:", error);
      setError(error instanceof Error ? error : new Error("Fehler bei der Neuzuweisung"));
      toast.error("Fehler bei der Neuzuweisung der Schicht");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setShifts(prev => {
      const updatedShifts = [...prev];
      const movedShift = updatedShifts.find(s => s.id === draggableId);
      
      if (movedShift) {
        movedShift.date = destination.droppableId;
      }
      
      return updatedShifts;
    });
    
    toast.success("Schicht erfolgreich verschoben");
  };

  return {
    shiftTypes,
    employees,
    shifts,
    isLoading,
    error,
    fetchShifts,
    createShift,
    reassignShift,
    handleDragEnd
  };
};

function format(date: Date, formatString: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return formatString
    .replace('yyyy', year.toString())
    .replace('MM', month)
    .replace('dd', day);
}
