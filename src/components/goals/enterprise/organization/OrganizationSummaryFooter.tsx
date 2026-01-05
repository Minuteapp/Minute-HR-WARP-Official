import { Building2, Users, User, Target } from "lucide-react";

interface OrganizationSummaryFooterProps {
  departmentCount: number;
  teamCount: number;
  employeeCount: number;
  goalCount: number;
}

export const OrganizationSummaryFooter = ({ 
  departmentCount, 
  teamCount, 
  employeeCount, 
  goalCount 
}: OrganizationSummaryFooterProps) => {
  return (
    <div className="flex items-center justify-center gap-8 py-4 mt-6 border-t text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <span>{departmentCount} Bereiche</span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>{teamCount} Teams</span>
      </div>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>{employeeCount} Mitarbeiter</span>
      </div>
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4" />
        <span>{goalCount} Ziele</span>
      </div>
    </div>
  );
};
