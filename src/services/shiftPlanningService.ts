
import { supabase } from '@/integrations/supabase/client';
import { ShiftType, Employee, Shift } from '@/types/shift-planning';

export interface ShiftPlanningData {
  shiftTypes: ShiftType[];
  employees: Employee[];
  shifts: Shift[];
}

class ShiftPlanningService {
  // Schichttypen von der Datenbank abrufen
  async getShiftTypes(): Promise<ShiftType[]> {
    try {
      const { data, error } = await supabase
        .from('shift_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(type => ({
        id: type.id,
        name: type.name,
        start_time: type.start_time,
        end_time: type.end_time,
        color: type.color || '#3B82F6',
        description: type.description || '',
        min_employees: type.min_employees || 1,
        max_employees: type.max_employees || 10,
        is_active: type.is_active,
        required_staff: type.required_staff || 1
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Schichttypen:', error);
      return [];
    }
  }

  // Mitarbeiter von der Datenbank abrufen
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(emp => ({
        id: emp.id,
        name: emp.name || `${emp.first_name} ${emp.last_name}`.trim(),
        department: emp.department || 'Nicht zugewiesen',
        position: emp.position || 'Mitarbeiter',
        skills: emp.skills || [],
        availability: emp.availability || {},
        preferences: emp.preferences || {},
        qualifications: emp.qualifications || [],
        preferredShifts: emp.preferredShifts || [],
        availableHours: emp.availableHours || { start: '08:00', end: '17:00' }
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      return [];
    }
  }

  // Schichten von der Datenbank abrufen
  async getShifts(startDate?: Date, endDate?: Date): Promise<Shift[]> {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          shift_types (
            name,
            start_time,
            end_time,
            color
          ),
          employees (
            name,
            first_name,
            last_name,
            department
          )
        `)
        .order('date', { ascending: true });
      
      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }
      
      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(shift => ({
        id: shift.id,
        type: shift.shift_type_id,
        date: shift.date,
        employeeId: shift.employee_id,
        employeeName: shift.employees?.name || `${shift.employees?.first_name} ${shift.employees?.last_name}`.trim() || 'Unbekannt',
        department: shift.employees?.department || 'Nicht zugewiesen',
        status: shift.status || 'scheduled',
        start_time: shift.start_time,
        end_time: shift.end_time,
        notes: shift.notes,
        requirements: []
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Schichten:', error);
      return [];
    }
  }

  // Neue Schicht erstellen
  async createShift(shiftData: {
    shiftTypeId: string;
    employeeId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }): Promise<Shift | null> {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          shift_type_id: shiftData.shiftTypeId,
          employee_id: shiftData.employeeId,
          date: shiftData.date,
          start_time: shiftData.startTime ? (() => {
            const t = shiftData.startTime as string;
            const core = t.includes('T') ? t : (t.length === 5 ? `${t}:00` : t);
            const hasTZ = /[Z+\-]/.test(core);
            return t.includes('T') ? core : `${shiftData.date}T${core}${hasTZ ? '' : 'Z'}`;
          })() : null,
          end_time: shiftData.endTime ? (() => {
            const t = shiftData.endTime as string;
            const core = t.includes('T') ? t : (t.length === 5 ? `${t}:00` : t);
            const hasTZ = /[Z+\-]/.test(core);
            return t.includes('T') ? core : `${shiftData.date}T${core}${hasTZ ? '' : 'Z'}`;
          })() : null,
          notes: shiftData.notes,
          status: 'scheduled'
        })
        .select(`
          *,
          shift_types (name, start_time, end_time, color),
          employees (name, first_name, last_name, department)
        `)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        type: data.shift_type_id,
        date: data.date,
        employeeId: data.employee_id,
        employeeName: data.employees?.name || `${data.employees?.first_name} ${data.employees?.last_name}`.trim() || 'Unbekannt',
        department: data.employees?.department || 'Nicht zugewiesen',
        status: data.status,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes,
        requirements: []
      };
    } catch (error) {
      console.error('Fehler beim Erstellen der Schicht:', error);
      return null;
    }
  }

  // Schicht aktualisieren
  async updateShift(shiftId: string, updates: Partial<{
    employeeId: string;
    status: string;
    notes: string;
    date: string;
  }>): Promise<Shift | null> {
    try {
      const updateData: any = {};
      
      if (updates.employeeId) updateData.employee_id = updates.employeeId;
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.date) updateData.date = updates.date;
      
      const { data, error } = await supabase
        .from('shifts')
        .update(updateData)
        .eq('id', shiftId)
        .select(`
          *,
          shift_types (name, start_time, end_time, color),
          employees (name, first_name, last_name, department)
        `)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        type: data.shift_type_id,
        date: data.date,
        employeeId: data.employee_id,
        employeeName: data.employees?.name || `${data.employees?.first_name} ${data.employees?.last_name}`.trim() || 'Unbekannt',
        department: data.employees?.department || 'Nicht zugewiesen',
        status: data.status,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes,
        requirements: []
      };
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Schicht:', error);
      return null;
    }
  }

  // Automatische Schichtzuweisung
  async autoAssignShifts(startDate: Date, endDate: Date): Promise<{
    success: boolean;
    assigned: number;
    conflicts: string[];
  }> {
    try {
      console.log('Starte automatische Schichtzuweisung für:', startDate, 'bis', endDate);
      
      // Hole alle Schichttypen und Mitarbeiter
      const [shiftTypes, employees] = await Promise.all([
        this.getShiftTypes(),
        this.getEmployees()
      ]);
      
      if (shiftTypes.length === 0 || employees.length === 0) {
        return { success: false, assigned: 0, conflicts: ['Keine Schichttypen oder Mitarbeiter verfügbar'] };
      }
      
      const conflicts: string[] = [];
      let assignedCount = 0;
      
      // Iteriere über jeden Tag im Zeitraum
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Prüfe, ob bereits Schichten für diesen Tag existieren
        const existingShifts = await this.getShifts(currentDate, currentDate);
        
        for (const shiftType of shiftTypes) {
          // Prüfe ob bereits eine Schicht dieses Typs an diesem Tag existiert
          const existingShift = existingShifts.find(s => s.type === shiftType.id);
          
          if (!existingShift) {
            // Finde verfügbaren Mitarbeiter für diese Schicht
            const availableEmployee = this.findAvailableEmployee(employees, shiftType, dateStr, existingShifts);
            
            if (availableEmployee) {
              const newShift = await this.createShift({
                shiftTypeId: shiftType.id,
                employeeId: availableEmployee.id,
                date: dateStr,
                startTime: shiftType.start_time,
                endTime: shiftType.end_time,
                notes: 'Automatisch zugewiesen'
              });
              
              if (newShift) {
                assignedCount++;
              } else {
                conflicts.push(`Fehler beim Erstellen der ${shiftType.name} am ${dateStr}`);
              }
            } else {
              conflicts.push(`Kein verfügbarer Mitarbeiter für ${shiftType.name} am ${dateStr}`);
            }
          }
        }
      }
      
      return {
        success: true,
        assigned: assignedCount,
        conflicts
      };
      
    } catch (error) {
      console.error('Fehler bei der automatischen Schichtzuweisung:', error);
      return {
        success: false,
        assigned: 0,
        conflicts: ['Unbekannter Fehler bei der Zuweisung']
      };
    }
  }

  // Hilfsmethode: Verfügbaren Mitarbeiter finden
  private findAvailableEmployee(
    employees: Employee[], 
    shiftType: ShiftType, 
    date: string, 
    existingShifts: Shift[]
  ): Employee | null {
    // Einfache Logik: Finde ersten Mitarbeiter, der noch keine Schicht an diesem Tag hat
    const busyEmployeeIds = existingShifts.map(s => s.employeeId);
    
    return employees.find(emp => !busyEmployeeIds.includes(emp.id)) || null;
  }

  // Schicht löschen
  async deleteShift(shiftId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen der Schicht:', error);
      return false;
    }
  }

  // KI-gestützte Schichtplanung generieren
  async generateShiftPlan(startDate: Date, endDate: Date, requirements: any = {}): Promise<{
    success: boolean;
    plan: Shift[];
    recommendations: string[];
  }> {
    try {
      console.log('Generiere KI-Schichtplan für:', startDate, 'bis', endDate);
      
      // Hole alle notwendigen Daten
      const [shiftTypes, employees] = await Promise.all([
        this.getShiftTypes(),
        this.getEmployees()
      ]);
      
      const plan: Shift[] = [];
      const recommendations: string[] = [];
      
      // Einfache KI-Logik: Optimiere basierend auf Mitarbeiterpräferenzen und Verfügbarkeit
      for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        for (const shiftType of shiftTypes) {
          // Finde besten Mitarbeiter für diese Schicht
          const bestEmployee = this.findBestEmployeeForShift(employees, shiftType, dateStr);
          
          if (bestEmployee) {
            plan.push({
              id: `generated_${Date.now()}_${plan.length}`,
              type: shiftType.id,
              date: dateStr,
              employeeId: bestEmployee.id,
              employeeName: bestEmployee.name,
              department: bestEmployee.department,
              status: 'scheduled',
              start_time: shiftType.start_time,
              end_time: shiftType.end_time,
              requirements: []
            });
          } else {
            recommendations.push(`Kein geeigneter Mitarbeiter für ${shiftType.name} am ${dateStr} gefunden`);
          }
        }
      }
      
      if (plan.length === 0) {
        recommendations.push('Keine Schichten konnten generiert werden. Prüfen Sie Mitarbeiterverfügbarkeit.');
      }
      
      return {
        success: plan.length > 0,
        plan,
        recommendations
      };
      
    } catch (error) {
      console.error('Fehler bei der KI-Schichtplanung:', error);
      return {
        success: false,
        plan: [],
        recommendations: ['Fehler bei der Schichtplanung aufgetreten']
      };
    }
  }

  // Hilfsmethode: Besten Mitarbeiter für Schicht finden
  private findBestEmployeeForShift(employees: Employee[], shiftType: ShiftType, date: string): Employee | null {
    // Bewerte Mitarbeiter basierend auf verschiedenen Faktoren
    const scores = employees.map(emp => ({
      employee: emp,
      score: this.calculateEmployeeScore(emp, shiftType, date)
    }));
    
    // Sortiere nach Score und wähle den besten
    scores.sort((a, b) => b.score - a.score);
    
    return scores.length > 0 && scores[0].score > 0 ? scores[0].employee : null;
  }

  // Berechne Score für Mitarbeiter-Schicht-Kombination
  private calculateEmployeeScore(employee: Employee, shiftType: ShiftType, date: string): number {
    let score = 1; // Basis-Score
    
    // Bonus für Abteilungs-Match
    if (employee.department === shiftType.description) {
      score += 2;
    }
    
    // Bonus für Präferenzen (falls vorhanden)
    if (employee.preferredShifts?.includes(shiftType.id)) {
      score += 3;
    }
    
    // Abzug für Überstunden (vereinfacht)
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Wochenende
      score -= 1;
    }
    
    return Math.max(0, score);
  }
}

export const shiftPlanningService = new ShiftPlanningService();
