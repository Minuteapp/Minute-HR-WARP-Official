import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Edit, Eye, Trash2, AlertCircle } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CostCenterSectionProps {
  employee: Employee | null;
}

export const CostCenterSection = ({ employee }: CostCenterSectionProps) => {
  // No mock data - cost centers should be loaded from database
  const costCenters: Array<{
    code: string;
    name: string;
    percentage: number;
    budget: string;
    budgetUsed: number;
  }> = [];

  const totalPercentage = costCenters.reduce((sum, cc) => sum + cc.percentage, 0);

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Building className="h-4 w-4" />
          Kostenstellen-Zuordnung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {costCenters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Kostenstellen zugeordnet
          </p>
        ) : (
          <>
            {costCenters.map((cc, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{cc.code}</h4>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {cc.percentage}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cc.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Budget: {cc.budget}</span>
                    <span className="font-medium">{cc.budgetUsed}% verwendet</span>
                  </div>
                  <Progress value={cc.budgetUsed} className="h-2" />
                </div>
              </div>
            ))}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Die Summe aller Kostenstellen-Anteile muss 100% ergeben.
              </p>
            </div>

            <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">Gesamt-Zuordnung:</span>
              <span className={`text-sm font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPercentage}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
