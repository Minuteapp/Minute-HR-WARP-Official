import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee.types';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';
import { emitEvent } from '@/services/eventEmitterService';
export const useEmployeeData = (employeeId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany, isSuperAdmin } = useTenant();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Überprüfen, ob das Startdatum in der Zukunft liegt
        if (data.start_date) {
          const startDate = new Date(data.start_date);
          startDate.setHours(0, 0, 0, 0); // Zeit nullen für korrekten Vergleich
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Zeit nullen für korrekten Vergleich
          
          console.log('Status Debug:', { 
            employeeId, 
            startDate: startDate.toISOString(), 
            today: today.toISOString(), 
            currentStatus: data.status,
            comparison: startDate <= today ? 'startDate <= today' : 'startDate > today'
          });
          
          // Wenn das Startdatum in der Vergangenheit oder heute liegt und der Status "inactive" ist, 
          // setzen wir den Status auf "active"
          if (startDate <= today && data.status === 'inactive') {
            console.log('Auto-activating employee because start_date is in the past');
            // Automatisch den Status in der Datenbank aktualisieren
            const { error: updateError } = await supabase
              .from('employees')
              .update({ status: 'active' })
              .eq('id', employeeId);
            
            if (!updateError) {
              data.status = 'active';
              console.log('Employee status updated to active');
            } else {
              console.error('Failed to auto-activate employee:', updateError);
            }
          }
          // Wenn das Startdatum in der Zukunft liegt, setzen wir den Status auf "inactive"
          else if (startDate > today && data.status === 'active') {
            data.status = 'inactive';
          }
        }
        
        return {
          ...data,
          status: data.status === 'active' ? 'active' : 'inactive'
        } as Employee;
      }

      return null;
    }
  });

  const { mutate: updateEmployee, isPending: isUpdating } = useMutation({
    mutationFn: async (updateData: Partial<Employee>) => {
      // Hole aktuellen Zustand für Event-Vergleich
      const { data: currentEmployee } = await supabase
        .from('employees')
        .select('department, role, status')
        .eq('id', employeeId)
        .single();

      // Überprüfen, ob das Startdatum in der Zukunft liegt und Status anpassen
      if (updateData.start_date) {
        const startDate = new Date(updateData.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Wenn das Startdatum in der Zukunft liegt, Status auf inactive setzen
        if (startDate > today) {
          updateData.status = 'inactive';
        }
        // Wenn das Startdatum heute oder in der Vergangenheit liegt, Status auf active setzen
        else if (startDate <= today && !updateData.status) {
          updateData.status = 'active';
        }
      }

      // Create clean update object - remove undefined values and ensure proper types
      const cleanUpdateData: any = {};
      Object.keys(updateData).forEach(key => {
        const value = (updateData as any)[key];
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });
      
      console.log('Updating employee with data:', cleanUpdateData);
      
      const { data, error } = await supabase
        .from('employees')
        .update(cleanUpdateData)
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);

      // Events für spezifische Änderungen emittieren
      if (currentEmployee) {
        // Department-Änderung
        if (updateData.department && updateData.department !== currentEmployee.department) {
          await emitEvent(
            'employee.department_changed',
            'employee',
            employeeId,
            'employees',
            {
              old_department: currentEmployee.department,
              new_department: updateData.department
            }
          );
        }

        // Role-Änderung
        if (updateData.role && updateData.role !== currentEmployee.role) {
          await emitEvent(
            'employee.role_changed',
            'employee',
            employeeId,
            'employees',
            {
              old_role: currentEmployee.role,
              new_role: updateData.role
            }
          );
        }

        // Status-Änderung auf inactive (Deaktivierung)
        if (updateData.status === 'inactive' && currentEmployee.status === 'active') {
          await emitEvent(
            'employee.deactivated',
            'employee',
            employeeId,
            'employees',
            {
              reason: 'status_change'
            }
          );
        }
      }

      // Allgemeines Update-Event
      await emitEvent(
        'employee.updated',
        'employee',
        employeeId,
        'employees',
        {
          updated_fields: Object.keys(cleanUpdateData)
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      toast({ title: 'Erfolgreich gespeichert', description: 'Mitarbeiterdaten wurden aktualisiert.' });
    },
    onError: (error: any) => {
      console.error('Update Mitarbeiter fehlgeschlagen:', error);
      toast({ variant: 'destructive', title: 'Fehler beim Speichern', description: error?.message || 'Aktualisierung fehlgeschlagen.' });
    }
  });

  const { mutate: deleteEmployee, isPending: isDeletingEmployee } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('employees')
        .update({ 
          archived: true,
          archived_at: new Date().toISOString(),
          status: 'inactive'
        })
        .eq('id', employeeId);

      if (error) throw error;

      // Event emittieren für Deaktivierung/Archivierung
      await emitEvent(
        'employee.deactivated',
        'employee',
        employeeId,
        'employees',
        {
          reason: 'archived',
          archived_at: new Date().toISOString()
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      toast({ title: 'Archiviert', description: 'Mitarbeiter wurde archiviert.' });
    },
    onError: (error: any) => {
      console.error('Archivieren fehlgeschlagen:', error);
      toast({ variant: 'destructive', title: 'Fehler beim Archivieren', description: error?.message || 'Aktion fehlgeschlagen.' });
    }
  });

  return {
    employee,
    isLoading,
    isUpdating,
    isDeletingEmployee,
    updateEmployee,
    deleteEmployee
  };
};
