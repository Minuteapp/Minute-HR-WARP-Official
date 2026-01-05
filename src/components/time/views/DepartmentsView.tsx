import { Card } from "@/components/ui/card";
import { Building } from "lucide-react";

interface DepartmentsViewProps {
  onSelectDepartment: (departmentId: string) => void;
}

const DepartmentsView = ({ onSelectDepartment }: DepartmentsViewProps) => {
  const departments: Array<{
    id: string;
    name: string;
    employees: number;
    active: number;
    avgHours: number;
    utilization: number;
  }> = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Abteilungen</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card 
            key={dept.id} 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectDepartment(dept.id)}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">{dept.name}</h3>
                <p className="text-sm text-muted-foreground">{dept.employees.toLocaleString()} Mitarbeiter</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center gap-8 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold">{dept.active.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ø Stunden</p>
                <p className="text-2xl font-bold">{dept.avgHours} h</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auslastung</span>
                <span className="font-medium">{dept.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all"
                  style={{ width: `${dept.utilization}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentsView;
