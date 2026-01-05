import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReportKPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface DepartmentData {
  name: string;
  value: number;
  color: string;
}

export interface EmployeeGrowthData {
  month: string;
  employees: number;
}

export interface AbsenceData {
  month: string;
  krankheit: number;
  sonstiges: number;
  urlaub: number;
}

export const useReportsData = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Mitarbeiterzahl
  const { data: employeeCount = 0, isLoading: employeesLoading } = useQuery({
    queryKey: ['reports-employee-count', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Krankheitsquote (letzte 30 Tage)
  const { data: sickLeaveRate = 0, isLoading: sickLeaveLoading } = useQuery({
    queryKey: ['reports-sick-leave-rate', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: sickDays, error } = await supabase
        .from('sick_leaves')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('start_date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Berechne Rate basierend auf Mitarbeiterzahl
      if (employeeCount > 0 && sickDays) {
        return Math.round((sickDays / employeeCount) * 100 * 10) / 10;
      }
      return 0;
    },
    enabled: !!companyId && employeeCount > 0,
  });

  // Aktive Projekte
  const { data: activeProjects = 0, isLoading: projectsLoading } = useQuery({
    queryKey: ['reports-active-projects', companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .in('status', ['active', 'in_progress']);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!companyId,
  });

  // Abteilungsverteilung
  const { data: departmentData = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ['reports-departments', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Gruppiere nach Abteilung
      const deptCounts: Record<string, number> = {};
      data?.forEach(emp => {
        const dept = emp.department || 'Sonstige';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      
      const colors = ['#4F46E5', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#9CA3AF'];
      const total = Object.values(deptCounts).reduce((a, b) => a + b, 0);
      
      return Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count], index) => ({
          name,
          value: total > 0 ? Math.round((count / total) * 100) : 0,
          color: colors[index % colors.length]
        }));
    },
    enabled: !!companyId,
  });

  // Abwesenheitsstatistik (letzte 6 Monate)
  const { data: absenceData = [], isLoading: absenceLoading } = useQuery({
    queryKey: ['reports-absence-stats', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const months: AbsenceData[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date.toISOString().split('T')[0];
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        const monthName = date.toLocaleString('de-DE', { month: 'short' });
        
        // Krankmeldungen
        const { count: sickCount } = await supabase
          .from('sick_leaves')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .gte('start_date', monthStart)
          .lte('start_date', monthEnd);
        
        // Urlaub
        const { count: vacationCount } = await supabase
          .from('absence_requests')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('type', 'vacation')
          .gte('start_date', monthStart)
          .lte('start_date', monthEnd);
        
        // Sonstige Abwesenheiten
        const { count: otherCount } = await supabase
          .from('absence_requests')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .neq('type', 'vacation')
          .gte('start_date', monthStart)
          .lte('start_date', monthEnd);
        
        months.push({
          month: monthName,
          krankheit: sickCount || 0,
          urlaub: vacationCount || 0,
          sonstiges: otherCount || 0
        });
      }
      
      return months;
    },
    enabled: !!companyId,
  });

  // Mitarbeiterwachstum (letzte 6 Monate) - basierend auf Eintrittsdaten
  const { data: employeeGrowthData = [], isLoading: growthLoading } = useQuery({
    queryKey: ['reports-employee-growth', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const months: EmployeeGrowthData[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        const monthName = date.toLocaleString('de-DE', { month: 'short' });
        
        // Zähle aktive Mitarbeiter bis zu diesem Datum
        const { count } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('status', 'active')
          .lte('hire_date', monthEnd);
        
        months.push({
          month: monthName,
          employees: count || 0
        });
      }
      
      return months;
    },
    enabled: !!companyId,
  });

  const isLoading = employeesLoading || sickLeaveLoading || projectsLoading || departmentsLoading || absenceLoading || growthLoading;

  return {
    employeeCount,
    sickLeaveRate,
    activeProjects,
    departmentData,
    absenceData,
    employeeGrowthData,
    isLoading,
    companyId
  };
};

export const useReportsList = () => {
  const { user } = useAuth();
  const companyId = user?.company_id;

  return useQuery({
    queryKey: ['reports-list', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      // Hole echte Report-Definitionen aus der DB falls vorhanden
      // Fallback auf Standard-Reports
      return [
        { 
          id: 'absence',
          title: "Abwesenheitsbericht", 
          description: "Vollständige Übersicht aller Abwesenheiten nach Typ, Abteilung und Zeitraum",
          category: "Personal",
          frequency: "Täglich",
          dataSource: 'absence_requests',
          formats: ["PDF", "Excel", "CSV"]
        },
        { 
          id: 'sick-leave',
          title: "Krankheitsstatistik", 
          description: "Detaillierte Analyse der Krankmeldungen mit Trends",
          category: "Gesundheit",
          frequency: "Täglich",
          dataSource: 'sick_leaves',
          formats: ["PDF", "Excel"]
        },
        { 
          id: 'payroll',
          title: "Lohn & Gehalt Monatsbericht", 
          description: "Monatliche Gehaltsabrechnung mit Kostenstellenaufteilung",
          category: "Payroll",
          frequency: "Monatlich",
          dataSource: 'payroll_records',
          formats: ["PDF", "Excel", "CSV"]
        },
        { 
          id: 'performance',
          title: "Performance-Review-Übersicht", 
          description: "Zusammenfassung aller Performance-Reviews",
          category: "Performance",
          frequency: "Wöchentlich",
          dataSource: 'performance_reviews',
          formats: ["PDF", "Excel"]
        },
        { 
          id: 'recruiting',
          title: "Recruiting Funnel Report", 
          description: "Bewerbungsprozess von der Bewerbung bis zur Einstellung",
          category: "Recruiting",
          frequency: "Wöchentlich",
          dataSource: 'job_applications',
          formats: ["PDF", "Excel", "CSV"]
        },
        { 
          id: 'projects',
          title: "Projektzeit-Report", 
          description: "Zeiterfassung nach Projekten mit Auslastungsanalyse",
          category: "Projekte",
          frequency: "Wöchentlich",
          dataSource: 'time_entries',
          formats: ["PDF", "Excel", "CSV"]
        },
      ];
    },
    enabled: !!companyId,
  });
};
