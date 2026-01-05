import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeesKPICards } from "../employees/EmployeesKPICards";
import { EmployeesFilterBar } from "../employees/EmployeesFilterBar";
import { EmployeePerformanceCard } from "../employees/EmployeePerformanceCard";
import { EmployeesPagination } from "../employees/EmployeesPagination";
import { EmployeePerformanceModal } from "../employees/EmployeePerformanceModal";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 20;

export const EmployeesTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch employees with departments
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['performance-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, first_name, last_name, position, email,
          departments(id, name),
          teams(id, name)
        `)
        .order('last_name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch departments for filter
  const { data: departments } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch goals for employees
  const { data: employeeGoals } = useQuery({
    queryKey: ['employee-goals-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('id, employee_id, progress, status');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch performance reviews
  const { data: reviews } = useQuery({
    queryKey: ['employee-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_reviews')
        .select('id, employee_id, created_at, status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate employee stats
  const employeesWithStats = useMemo(() => {
    if (!employees) return [];

    return employees.map(emp => {
      const empGoals = employeeGoals?.filter(g => g.employee_id === emp.id) || [];
      const activeGoals = empGoals.length;
      const avgProgress = activeGoals > 0 
        ? Math.round(empGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals)
        : 0;
      
      const empReviews = reviews?.filter(r => r.employee_id === emp.id) || [];
      const lastReview = empReviews[0];
      const overdueReviews = empReviews.filter(r => r.status === 'pending').length;
      
      let status: 'critical' | 'normal' | 'excellent' = 'normal';
      if (avgProgress >= 75) status = 'excellent';
      else if (avgProgress < 50) status = 'critical';

      return {
        ...emp,
        department_name: (emp.departments as any)?.name,
        team_name: (emp.teams as any)?.name,
        activeGoals,
        goalAchievement: avgProgress,
        lastReviewDate: lastReview?.created_at || null,
        overdueReviews,
        status
      };
    });
  }, [employees, employeeGoals, reviews]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeesWithStats.filter(emp => {
      const matchesSearch = searchQuery === '' || 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || 
        (emp.departments as any)?.id === departmentFilter;
      
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employeesWithStats, searchQuery, departmentFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = employeesWithStats.length;
    const excellent = employeesWithStats.filter(e => e.status === 'excellent').length;
    const normal = employeesWithStats.filter(e => e.status === 'normal').length;
    const critical = employeesWithStats.filter(e => e.status === 'critical').length;
    const avgGoalAchievement = total > 0
      ? Math.round(employeesWithStats.reduce((sum, e) => sum + e.goalAchievement, 0) / total)
      : 0;

    return { total, excellent, normal, critical, avgGoalAchievement };
  }, [employeesWithStats]);

  const handleViewDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  // Get employee goals for modal
  const selectedEmployeeGoals = useMemo(() => {
    if (!selectedEmployee || !employeeGoals) return [];
    return employeeGoals
      .filter(g => g.employee_id === selectedEmployee.id)
      .map(g => ({
        id: g.id,
        title: `Ziel ${g.id.slice(0, 8)}`,
        progress: g.progress || 0,
        status: g.status === 'completed' ? 'completed' : 
                (g.progress || 0) >= 50 ? 'on_track' : 'at_risk'
      }));
  }, [selectedEmployee, employeeGoals]);

  if (loadingEmployees) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-12" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeesKPICards
        total={kpis.total}
        excellent={kpis.excellent}
        normal={kpis.normal}
        critical={kpis.critical}
        avgGoalAchievement={kpis.avgGoalAchievement}
      />

      <EmployeesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departments={departments || []}
        totalCount={employeesWithStats.length}
        filteredCount={filteredEmployees.length}
      />

      <div className="space-y-4">
        {paginatedEmployees.map((employee) => (
          <EmployeePerformanceCard
            key={employee.id}
            employee={employee}
            activeGoals={employee.activeGoals}
            goalAchievement={employee.goalAchievement}
            lastReviewDate={employee.lastReviewDate}
            overdueReviews={employee.overdueReviews}
            status={employee.status}
            onViewDetails={() => handleViewDetails(employee)}
          />
        ))}
      </div>

      {filteredEmployees.length > ITEMS_PER_PAGE && (
        <EmployeesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <EmployeePerformanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        employee={selectedEmployee}
        overallScore={selectedEmployee?.goalAchievement || 0}
        goalsScore={selectedEmployee?.goalAchievement || 0}
        tasksScore={50}
        feedbackScore={50}
        developmentScore={50}
        trend="stable"
        goals={selectedEmployeeGoals as any}
      />
    </div>
  );
};
