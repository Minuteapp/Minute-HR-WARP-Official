import { EmployeeActionsSection } from "./EmployeeActionsSection";

interface Action {
  id: string;
  title: string;
  description?: string;
  action_type: string;
  status: string;
  due_date?: string;
  employee_id: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
}

interface DevelopmentByEmployeeListProps {
  actions: Action[];
  employees: Employee[];
  onCompleteAction: (actionId: string) => void;
}

export const DevelopmentByEmployeeList = ({
  actions,
  employees,
  onCompleteAction
}: DevelopmentByEmployeeListProps) => {
  // Group actions by employee
  const actionsByEmployee = employees
    .map(employee => {
      const empActions = actions.filter(a => a.employee_id === employee.id);
      return {
        employee,
        actions: empActions
      };
    })
    .filter(group => group.actions.length > 0);

  if (actionsByEmployee.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Keine Entwicklungsmaßnahmen gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {actionsByEmployee.map(({ employee, actions }) => (
        <EmployeeActionsSection
          key={employee.id}
          employee={employee}
          actions={actions}
          onCompleteAction={onCompleteAction}
        />
      ))}
    </div>
  );
};
