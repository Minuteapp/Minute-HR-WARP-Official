import { supabase } from '@/integrations/supabase/client';

interface TeamFilters {
  departments?: string[];
  locations?: string[];
  statuses?: string[];
}

export const teamAbsenceService = {
  // Team-Übersicht mit Abwesenheitsdaten
  async getTeamOverview(filters?: TeamFilters) {
    let query = supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        employee_number,
        department,
        city,
        email,
        phone,
        vacation_days,
        status
      `)
      .eq('status', 'active');

    if (filters?.departments?.length) {
      query = query.in('department', filters.departments);
    }
    if (filters?.locations?.length) {
      query = query.in('city', filters.locations);
    }

    const { data: employees, error: employeesError } = await query;
    
    if (employeesError) {
      console.error('Fehler beim Laden der Mitarbeiter:', employeesError);
      throw employeesError;
    }

    // Hole aktuelle Abwesenheiten für jeden Mitarbeiter
    const { data: absences, error: absencesError } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('status', 'approved');

    if (absencesError) {
      console.error('Fehler beim Laden der Abwesenheiten:', absencesError);
      throw absencesError;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mappe Mitarbeiter mit ihren Abwesenheiten
    const teamMembers = (employees || []).map(emp => {
      const employeeAbsences = absences?.filter(a => a.user_id === emp.id) || [];
      
      // Finde aktuelle Abwesenheit
      const currentAbsence = employeeAbsences.find(a => {
        const start = new Date(a.start_date);
        const end = new Date(a.end_date);
        return start <= today && end >= today;
      });

      // Berechne verschiedene Abwesenheitstypen
      const vacationDays = employeeAbsences
        .filter(a => a.type === 'vacation')
        .reduce((sum, a) => {
          const days = Math.ceil((new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);

      const sickDays = employeeAbsences
        .filter(a => a.type === 'sick_leave')
        .reduce((sum, a) => {
          const days = Math.ceil((new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);

      const homeofficeDays = employeeAbsences
        .filter(a => a.type === 'business_trip')
        .reduce((sum, a) => {
          const days = Math.ceil((new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);

      // Bestimme Status
      let status: 'absent' | 'available' | 'pending' = 'available';
      if (currentAbsence) {
        status = 'absent';
      } else {
        // Prüfe auf ausstehende Anträge
        const hasPendingRequest = employeeAbsences.some(a => a.status === 'pending');
        if (hasPendingRequest) {
          status = 'pending';
        }
      }

      // Filter nach Status
      if (filters?.statuses?.length && !filters.statuses.includes(status)) {
        return null;
      }

      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        employeeNumber: emp.employee_number,
        department: emp.department,
        location: emp.city,
        vacationDays,
        sickDays,
        homeofficeDays,
        remainingVacation: emp.vacation_days || 30,
        status,
        currentAbsence: currentAbsence ? {
          type: currentAbsence.type,
          startDate: new Date(currentAbsence.start_date),
          endDate: new Date(currentAbsence.end_date)
        } : undefined
      };
    }).filter(Boolean);

    return teamMembers;
  },

  // Statistiken berechnen
  async getTeamStatistics() {
    const { data: allAbsences, error: absencesError } = await supabase
      .from('absence_requests')
      .select('*');

    if (absencesError) {
      console.error('Fehler beim Laden der Abwesenheiten:', absencesError);
      throw absencesError;
    }

    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('vacation_days')
      .eq('status', 'active');

    if (employeesError) {
      console.error('Fehler beim Laden der Mitarbeiter:', employeesError);
      throw employeesError;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentAbsences = allAbsences?.filter(a => {
      const start = new Date(a.start_date);
      const end = new Date(a.end_date);
      return a.status === 'approved' && start <= today && end >= today;
    }) || [];

    const avgRemainingVacation = employees && employees.length > 0
      ? employees.reduce((sum, e) => sum + (e.vacation_days || 30), 0) / employees.length
      : 30;

    const absenceRate = employees && employees.length > 0
      ? ((currentAbsences.length / employees.length) * 100)
      : 0;

    const pendingRequests = allAbsences?.filter(a => a.status === 'pending').length || 0;

    return {
      currentAbsences: currentAbsences.length,
      avgRemainingVacation: Math.round(avgRemainingVacation),
      absenceRate: absenceRate.toFixed(1),
      pendingRequests
    };
  },

  // Abteilungen aus DB laden
  async getDepartments() {
    const { data, error } = await supabase
      .from('employees')
      .select('department')
      .eq('status', 'active')
      .not('department', 'is', null);

    if (error) {
      console.error('Fehler beim Laden der Abteilungen:', error);
      throw error;
    }

    const departments = [...new Set(data?.map(e => e.department))];
    return departments.filter(Boolean);
  },

  // Standorte aus DB laden
  async getLocations() {
    const { data, error } = await supabase
      .from('employees')
      .select('city')
      .eq('status', 'active')
      .not('city', 'is', null);

    if (error) {
      console.error('Fehler beim Laden der Standorte:', error);
      throw error;
    }

    const locations = [...new Set(data?.map(e => e.city))];
    return locations.filter(Boolean);
  }
};
