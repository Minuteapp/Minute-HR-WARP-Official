import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoalsKPICards } from "../goals/GoalsKPICards";
import { GoalsFilterBar } from "../goals/GoalsFilterBar";
import { GoalsByEmployeeList } from "../goals/GoalsByEmployeeList";
import { GoalTrackingModal } from "../goals/GoalTrackingModal";
import { Skeleton } from "@/components/ui/skeleton";

export const GoalsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch goals
  const { data: goals, isLoading: loadingGoals } = useQuery({
    queryKey: ['performance-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['goals-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position, department_id')
        .order('last_name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['goals-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch milestones for selected goal
  const { data: milestones } = useQuery({
    queryKey: ['goal-milestones', selectedGoal?.id],
    enabled: !!selectedGoal?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', selectedGoal.id)
        .order('created_at');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch activities for selected goal
  const { data: activities } = useQuery({
    queryKey: ['goal-activities', selectedGoal?.id],
    enabled: !!selectedGoal?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_activities')
        .select('*')
        .eq('goal_id', selectedGoal.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Filter goals
  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    
    return goals.filter(goal => {
      const matchesSearch = searchQuery === '' || 
        goal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = employeeFilter === 'all' || goal.employee_id === employeeFilter;
      
      const employee = employees?.find(e => e.id === goal.employee_id);
      const matchesDepartment = departmentFilter === 'all' || 
        employee?.department_id === departmentFilter;
      
      const goalStatus = goal.status || (goal.progress >= 50 ? 'in_progress' : 'at_risk');
      const matchesStatus = statusFilter === 'all' || goalStatus === statusFilter;

      return matchesSearch && matchesEmployee && matchesDepartment && matchesStatus;
    });
  }, [goals, employees, searchQuery, employeeFilter, departmentFilter, statusFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!goals) return { total: 0, completed: 0, onTrack: 0, atRisk: 0 };
    
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const onTrack = goals.filter(g => g.status === 'in_progress' || (g.progress >= 50 && g.status !== 'completed')).length;
    const atRisk = goals.filter(g => g.status === 'at_risk' || (g.progress < 50 && g.status !== 'completed')).length;

    return { total, completed, onTrack, atRisk };
  }, [goals]);

  const handleViewGoal = (goal: any) => {
    const employee = employees?.find(e => e.id === goal.employee_id);
    setSelectedGoal({
      ...goal,
      employee_name: employee ? `${employee.first_name} ${employee.last_name}` : undefined,
      status: goal.status || (goal.progress >= 50 ? 'in_progress' : 'at_risk')
    });
    setModalOpen(true);
  };

  // Map goals with status
  const goalsWithStatus = useMemo(() => {
    return filteredGoals.map(g => ({
      ...g,
      status: g.status || (g.progress >= 50 ? 'in_progress' : 'at_risk')
    }));
  }, [filteredGoals]);

  if (loadingGoals) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoalsKPICards
        total={kpis.total}
        completed={kpis.completed}
        onTrack={kpis.onTrack}
        atRisk={kpis.atRisk}
      />

      <GoalsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        employeeFilter={employeeFilter}
        onEmployeeChange={setEmployeeFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sourceFilter={sourceFilter}
        onSourceChange={setSourceFilter}
        employees={employees || []}
        departments={departments || []}
        totalCount={goals?.length || 0}
        filteredCount={filteredGoals.length}
      />

      <GoalsByEmployeeList
        goals={goalsWithStatus}
        employees={employees || []}
        onViewGoal={handleViewGoal}
      />

      <GoalTrackingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        goal={selectedGoal}
        milestones={milestones || []}
        activities={activities || []}
      />
    </div>
  );
};
