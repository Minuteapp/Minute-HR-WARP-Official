import { ActionCard } from "./ActionCard";

interface Action {
  id: string;
  title: string;
  description?: string;
  action_type: string;
  status: string;
  due_date?: string;
}

interface EmployeeActionsSectionProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    position?: string;
  };
  actions: Action[];
  onCompleteAction: (actionId: string) => void;
}

export const EmployeeActionsSection = ({
  employee,
  actions,
  onCompleteAction
}: EmployeeActionsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {employee.first_name} {employee.last_name}
          </h3>
          {employee.position && (
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Maßnahmen</p>
          <p className="text-xl font-bold">{actions.length}</p>
        </div>
      </div>
      
      <div className="space-y-3 pl-4 border-l-2 border-muted">
        {actions.map((action) => (
          <ActionCard 
            key={action.id} 
            action={action} 
            onComplete={() => onCompleteAction(action.id)}
          />
        ))}
      </div>
    </div>
  );
};
