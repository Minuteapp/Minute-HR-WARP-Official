import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Truck, Calendar, MapPin, Fuel, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface FleetTabContentProps {
  employeeId: string;
}

interface VehicleAssignment {
  id: string;
  vehicle_id: string;
  assigned_from: string;
  assigned_until?: string;
  is_primary: boolean;
  vehicle: {
    id: string;
    license_plate: string;
    make: string;
    model: string;
    year: number;
    vehicle_type: string;
    fuel_type: string;
    status: string;
  };
}

export const FleetTabContent = ({ employeeId }: FleetTabContentProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['employee-vehicles', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_fleet_assignments')
        .select(`
          *,
          vehicle:hr_fleet_vehicles(*)
        `)
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false });
      
      if (error) {
        console.error('Fleet assignments error:', error);
        return [];
      }
      return data as VehicleAssignment[];
    }
  });

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'truck':
      case 'van':
        return <Truck className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-800 border-green-200";
      case 'maintenance':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'inactive':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric':
        return "bg-green-100 text-green-800 border-green-200";
      case 'hybrid':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'diesel':
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 'gasoline':
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Zugewiesene Fahrzeuge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine Fahrzeuge zugewiesen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {getVehicleIcon(assignment.vehicle.vehicle_type)}
                        <div>
                          <h3 className="font-semibold">
                            {assignment.vehicle.make} {assignment.vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {assignment.vehicle.license_plate} • {assignment.vehicle.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {assignment.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Hauptfahrzeug
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(assignment.vehicle.status)}`}
                        >
                          {assignment.vehicle.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Zugewiesen seit</p>
                          <p className="font-medium">
                            {format(new Date(assignment.assigned_from), 'dd.MM.yyyy', { locale: de })}
                          </p>
                        </div>
                      </div>

                      {assignment.assigned_until && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Zugewiesen bis</p>
                            <p className="font-medium">
                              {format(new Date(assignment.assigned_until), 'dd.MM.yyyy', { locale: de })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Kraftstoff</p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getFuelTypeColor(assignment.vehicle.fuel_type)}`}
                          >
                            {assignment.vehicle.fuel_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Usage Statistics */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fahrzeugnutzung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">Zugewiesene Fahrzeuge</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">
                  {assignments.filter(a => a.is_primary).length}
                </p>
                <p className="text-sm text-muted-foreground">Hauptfahrzeuge</p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">
                  {assignments.filter(a => a.vehicle.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Aktive Fahrzeuge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};