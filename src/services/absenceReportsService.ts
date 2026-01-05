import { supabase } from '@/integrations/supabase/client';

// Hilfsfunktion: Arbeitstage berechnen (ohne Wochenenden)
function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
}

export const absenceReportsService = {
  // Monatliche Abwesenheiten für ein Jahr
  async getMonthlyAbsences(year: number, departmentFilter?: string) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    let query = supabase
      .from('absence_requests')
      .select('type, start_date, end_date, department')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .eq('status', 'approved');
    
    if (departmentFilter && departmentFilter !== 'all' && departmentFilter !== 'all-employees') {
      query = query.eq('department', departmentFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Fehler beim Laden der monatlichen Abwesenheiten:', error);
      throw error;
    }
    
    // Gruppiere nach Monat und Typ
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(year, i).toLocaleString('de', { month: 'short' }),
      vacation: 0,
      sick: 0,
      homeoffice: 0,
      other: 0,
      total: 0
    }));
    
    data?.forEach(absence => {
      const month = new Date(absence.start_date).getMonth();
      const days = calculateWorkingDays(absence.start_date, absence.end_date);
      
      if (absence.type === 'vacation') {
        monthlyData[month].vacation += days;
      } else if (absence.type === 'sick_leave') {
        monthlyData[month].sick += days;
      } else if (absence.type === 'business_trip') {
        monthlyData[month].homeoffice += days;
      } else {
        monthlyData[month].other += days;
      }
      
      monthlyData[month].total += days;
    });
    
    return monthlyData;
  },

  // Statistiken für ein Jahr
  async getYearlyStatistics(year: number) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    // Durchschnittliche Abwesenheitsrate
    const { data: absences } = await supabase
      .from('absence_requests')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .eq('status', 'approved');
    
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const totalDays = absences?.reduce((sum, a) => 
      sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
    
    const avgAbsenceRate = (totalDays / (employeeCount || 1) / 252) * 100;
    
    // Durchschnittliche Urlaubstage
    const vacationDays = absences?.filter(a => a.type === 'vacation')
      .reduce((sum, a) => sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
    const avgVacationDays = vacationDays / (employeeCount || 1);
    
    // Durchschnittliche Krankheitstage
    const sickDays = absences?.filter(a => a.type === 'sick_leave')
      .reduce((sum, a) => sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
    const avgSickDays = sickDays / (employeeCount || 1);
    
    // Resturlaub gesamt aus absence_quotas
    const { data: quotas } = await supabase
      .from('absence_quotas')
      .select('total_days, used_days, planned_days')
      .eq('absence_type', 'vacation')
      .eq('quota_year', year);
    
    const totalRemainingVacation = quotas?.reduce((sum, q) => 
      sum + (q.total_days - q.used_days - q.planned_days), 0) || 0;
    
    return {
      absenceRate: avgAbsenceRate.toFixed(1),
      avgVacationDays: avgVacationDays.toFixed(1),
      avgSickDays: avgSickDays.toFixed(1),
      totalRemainingVacation
    };
  },

  // Verteilung nach Abwesenheitsart
  async getAbsenceDistribution(year: number) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const { data } = await supabase
      .from('absence_requests')
      .select('type, start_date, end_date')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .eq('status', 'approved');
    
    const distribution = {
      vacation: 0,
      sick_leave: 0,
      business_trip: 0,
      other: 0
    };
    
    data?.forEach(absence => {
      const days = calculateWorkingDays(absence.start_date, absence.end_date);
      
      if (absence.type === 'vacation') {
        distribution.vacation += days;
      } else if (absence.type === 'sick_leave') {
        distribution.sick_leave += days;
      } else if (absence.type === 'business_trip') {
        distribution.business_trip += days;
      } else {
        distribution.other += days;
      }
    });
    
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0) || 1;
    
    return {
      vacation: { 
        days: distribution.vacation, 
        percentage: ((distribution.vacation / total) * 100).toFixed(0) 
      },
      sick_leave: { 
        days: distribution.sick_leave, 
        percentage: ((distribution.sick_leave / total) * 100).toFixed(0) 
      },
      business_trip: { 
        days: distribution.business_trip, 
        percentage: ((distribution.business_trip / total) * 100).toFixed(0) 
      },
      other: { 
        days: distribution.other, 
        percentage: ((distribution.other / total) * 100).toFixed(0) 
      }
    };
  },

  // Abteilungsvergleich
  async getDepartmentComparison(year: number) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    // Hole alle Abteilungen
    const { data: departments } = await supabase
      .from('employees')
      .select('department')
      .eq('status', 'active')
      .not('department', 'is', null);
    
    const uniqueDepts = [...new Set(departments?.map(e => e.department).filter(Boolean))];
    
    const comparison = await Promise.all(
      uniqueDepts.map(async (dept) => {
        const { data: deptAbsences } = await supabase
          .from('absence_requests')
          .select('type, start_date, end_date')
          .eq('department', dept)
          .gte('start_date', startDate)
          .lte('end_date', endDate)
          .eq('status', 'approved');
        
        const { count: deptEmployeeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept)
          .eq('status', 'active');
        
        const totalDays = deptAbsences?.reduce((sum, a) => 
          sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
        
        const vacationDays = deptAbsences?.filter(a => a.type === 'vacation')
          .reduce((sum, a) => sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
        
        const sickDays = deptAbsences?.filter(a => a.type === 'sick_leave')
          .reduce((sum, a) => sum + calculateWorkingDays(a.start_date, a.end_date), 0) || 0;
        
        const employeeCount = deptEmployeeCount || 1;
        const absenceRate = (totalDays / employeeCount / 252) * 100;
        
        return {
          department: dept,
          absenceRate: absenceRate.toFixed(1),
          avgVacationDays: (vacationDays / employeeCount).toFixed(1),
          avgSickDays: (sickDays / employeeCount).toFixed(1),
          status: absenceRate > 10 ? 'elevated' : absenceRate > 7 ? 'normal' : 'good'
        };
      })
    );
    
    return comparison;
  }
};
