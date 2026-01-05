import { Card } from "@/components/ui/card";

const LocationDepartmentsTab = () => {
  const departments: Array<{ name: string; employees: number; officeSpace: string; active: number; avgHours: string }> = [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {departments.map((dept, index) => {
        const activeRate = Math.round((dept.active / dept.employees) * 100);
        
        return (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{dept.name}</h3>
                <p className="text-sm text-muted-foreground">{dept.officeSpace}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {dept.employees} MA
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-blue-600">Aktiv jetzt</span>
                  <span className="font-medium">{dept.active} / {dept.employees}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 rounded-full"
                    style={{ width: `${activeRate}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ø Arbeitsstunden</span>
                <span className="font-medium">{dept.avgHours}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LocationDepartmentsTab;
