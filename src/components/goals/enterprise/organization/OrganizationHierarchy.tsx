import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyLevelCard } from "./CompanyLevelCard";
import { DepartmentCard } from "./DepartmentCard";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationHierarchyProps {
  showGoals: boolean;
}

export const OrganizationHierarchy = ({ showGoals }: OrganizationHierarchyProps) => {
  const { data: departments = [], isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingDepts || loadingTeams || loadingEmployees || loadingGoals;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const totalEmployees = employees.length;
  const totalDepartments = departments.length;
  const totalTeams = teams.length;
  const companyGoals = goals.filter(g => g.goal_level === 'company');
  const avgProgress = companyGoals.length > 0 
    ? Math.round(companyGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / companyGoals.length)
    : 0;

  const getEmployeeGoals = (employeeId: string) => {
    return goals
      .filter(g => g.assigned_to === employeeId)
      .map(g => ({
        id: g.id,
        title: g.title,
        progress: g.progress || 0,
        status: g.status || 'on_track',
      }));
  };

  const departmentData = departments.map(dept => {
    const deptTeams = teams.filter(t => t.department_id === dept.id);
    const deptEmployees = employees.filter(e => e.department === dept.name);
    
    return {
      id: dept.id,
      name: dept.name,
      employeeCount: deptEmployees.length,
      managerName: dept.manager_name || 'Nicht zugewiesen',
      teamCount: deptTeams.length,
      teams: deptTeams.map(team => {
        const teamEmployees = employees.filter(e => e.team === team.name);
        return {
          id: team.id,
          name: team.name,
          memberCount: teamEmployees.length,
          employees: teamEmployees.map(emp => {
            const empGoals = getEmployeeGoals(emp.id);
            const avgEmpProgress = empGoals.length > 0
              ? Math.round(empGoals.reduce((sum, g) => sum + g.progress, 0) / empGoals.length)
              : 0;
            return {
              id: emp.id,
              name: `${emp.first_name} ${emp.last_name}`,
              goalCount: empGoals.length,
              averageProgress: avgEmpProgress,
              goals: empGoals,
            };
          }),
        };
      }),
    };
  });

  return (
    <div className="space-y-4">
      <CompanyLevelCard
        employeeCount={totalEmployees}
        departmentCount={totalDepartments}
        teamCount={totalTeams}
        goalCount={companyGoals.length}
        averageProgress={avgProgress}
      />
      
      {departmentData.map((dept) => (
        <DepartmentCard
          key={dept.id}
          name={dept.name}
          employeeCount={dept.employeeCount}
          managerName={dept.managerName}
          teamCount={dept.teamCount}
          teams={dept.teams}
          showGoals={showGoals}
        />
      ))}
    </div>
  );
};
