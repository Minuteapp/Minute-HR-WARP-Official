import { Card } from "@/components/ui/card";
import { Monitor, Car, LayoutGrid, Utensils, Users, Wifi, Video, Shield, Coffee } from "lucide-react";

const LocationInfrastructureTab = () => {
  const resources: Array<{ icon: any; name: string; utilization: number; total: number; available: number; occupied: number }> = [];

  const equipment: Array<{ icon: any; name: string; value: string }> = [];

  return (
    <div className="space-y-6">
      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <resource.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">Auslastung: {resource.utilization}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gesamt</span>
                <span className="font-medium">{resource.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Verfügbar</span>
                <span className="font-medium text-green-600">{resource.available}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Belegt</span>
                <span className="font-medium text-orange-600">{resource.occupied}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full"
                  style={{ width: `${resource.utilization}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Technical Equipment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Technische Ausstattung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {equipment.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LocationInfrastructureTab;
