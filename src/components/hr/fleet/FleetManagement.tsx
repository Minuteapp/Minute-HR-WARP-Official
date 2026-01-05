
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Fuel, Calendar, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const FleetManagement = () => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['hr-fleet-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_fleet_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fuhrparkmanagement</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Fahrzeug hinzufügen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles?.length || 0}</p>
                <p className="text-sm text-gray-500">Fahrzeuge gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles?.filter(v => v.status === 'available').length || 0}</p>
                <p className="text-sm text-gray-500">Verfügbar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Fuel className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles?.filter(v => v.status === 'in_use').length || 0}</p>
                <p className="text-sm text-gray-500">Im Einsatz</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vehicles?.filter(v => v.status === 'maintenance').length || 0}</p>
                <p className="text-sm text-gray-500">Wartung</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Fahrzeugübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles?.length > 0 ? (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{vehicle.make} {vehicle.model}</h3>
                      <p className="text-sm text-gray-500">Kennzeichen: {vehicle.license_plate}</p>
                      <p className="text-xs text-gray-400">Baujahr: {vehicle.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        vehicle.status === 'available'
                          ? 'default'
                          : vehicle.status === 'in_use'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {vehicle.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine Fahrzeuge registriert</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
