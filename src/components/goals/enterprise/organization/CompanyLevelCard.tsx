import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface CompanyLevelCardProps {
  employeeCount: number;
  departmentCount: number;
  teamCount: number;
  goalCount: number;
  averageProgress: number;
}

export const CompanyLevelCard = ({ 
  employeeCount, 
  departmentCount, 
  teamCount, 
  goalCount, 
  averageProgress 
}: CompanyLevelCardProps) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Unternehmensebene</h3>
              <p className="text-sm text-muted-foreground">
                {employeeCount} Mitarbeiter · {departmentCount} Bereiche · {teamCount} Teams
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Ziele: {goalCount}</div>
            <div className="text-sm font-medium">Fortschritt: {averageProgress}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
