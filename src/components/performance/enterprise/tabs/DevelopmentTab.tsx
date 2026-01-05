import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DevelopmentKPICards } from "../development/DevelopmentKPICards";
import { DevelopmentFilterBar } from "../development/DevelopmentFilterBar";
import { DevelopmentByEmployeeList } from "../development/DevelopmentByEmployeeList";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const DevelopmentTab = () => {
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch development actions
  const { data: actions, isLoading } = useQuery({
    queryKey: ['development-actions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('development_actions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch employees
  const { data: employees } = useQuery({
    queryKey: ['development-employees'],
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
    queryKey: ['development-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Complete action mutation
  const completeAction = useMutation({
    mutationFn: async (actionId: string) => {
      const { error } = await supabase
        .from('development_actions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', actionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Maßnahme abgeschlossen');
      queryClient.invalidateQueries({ queryKey: ['development-actions'] });
    },
    onError: () => {
      toast.error('Fehler beim Abschließen der Maßnahme');
    }
  });

  // Filter actions
  const filteredActions = useMemo(() => {
    if (!actions) return [];
    
    return actions.filter(action => {
      const matchesEmployee = employeeFilter === 'all' || action.employee_id === employeeFilter;
      
      const employee = employees?.find(e => e.id === action.employee_id);
      const matchesDepartment = departmentFilter === 'all' || 
        employee?.department_id === departmentFilter;
      
      const matchesType = typeFilter === 'all' || action.action_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || action.status === statusFilter;

      return matchesEmployee && matchesDepartment && matchesType && matchesStatus;
    });
  }, [actions, employees, employeeFilter, departmentFilter, typeFilter, statusFilter]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!actions) return { trainings: 0, goalAdjustments: 0, completed: 0, coaching: 0 };
    
    return {
      trainings: actions.filter(a => a.action_type === 'training').length,
      goalAdjustments: actions.filter(a => a.action_type === 'goal_adjustment').length,
      completed: actions.filter(a => a.status === 'completed').length,
      coaching: actions.filter(a => a.action_type === 'coaching').length
    };
  }, [actions]);

  if (isLoading) {
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
      <DevelopmentKPICards
        trainings={kpis.trainings}
        goalAdjustments={kpis.goalAdjustments}
        completed={kpis.completed}
        coaching={kpis.coaching}
      />

      <DevelopmentFilterBar
        employeeFilter={employeeFilter}
        onEmployeeChange={setEmployeeFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        employees={employees || []}
        departments={departments || []}
        onAddAction={() => {}}
      />

      <DevelopmentByEmployeeList
        actions={filteredActions}
        employees={employees || []}
        onCompleteAction={(actionId) => completeAction.mutate(actionId)}
      />
    </div>
  );
};
