import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import LocationDetailView from "./location/LocationDetailView";

const LocationsView = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locations: Array<{
    name: string;
    address: string;
    employees: number;
    active: number;
    weekHours: string;
    activityRate: number;
  }> = [];

  if (selectedLocation) {
    const location = locations.find(l => l.name === selectedLocation);
    return (
      <LocationDetailView 
        location={location!} 
        onBack={() => setSelectedLocation(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Standorte</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((location, index) => (
          <Card 
            key={index} 
            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedLocation(location.name)}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">{location.name}</h3>
                <p className="text-sm text-muted-foreground">{location.employees.toLocaleString()} Mitarbeiter</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-6">
              <div>
                <span className="text-muted-foreground">Aktiv</span>
                <p className="text-2xl font-semibold">{location.active.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Stunden</span>
                <p className="text-2xl font-semibold">{location.weekHours}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Aktivitätsrate</span>
                <span className="font-medium">{location.activityRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full"
                  style={{ width: `${location.activityRate}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocationsView;
