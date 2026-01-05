import { Car, Plus, Info, Fuel, Calendar, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EmployeeFleetTabContentProps {
  employeeId: string;
}

export const EmployeeFleetTabContent = ({ employeeId }: EmployeeFleetTabContentProps) => {
  const { canCreate } = useEnterprisePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const queryClient = useQueryClient();

  // Echte Daten für Fahrzeugzuweisungen aus hr_fleet_assignments (korrekte Tabelle)
  const { data: vehicleAssignments = [], isLoading } = useQuery({
    queryKey: ['employee-vehicle-assignments', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_fleet_assignments')
        .select(`
          *,
          vehicle:hr_fleet_vehicles(*)
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId
  });

  // Verfügbare Fahrzeuge laden aus hr_fleet_vehicles
  const { data: availableVehicles = [] } = useQuery({
    queryKey: ['available-fleet-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_fleet_vehicles')
        .select('id, license_plate, brand, model, year, status')
        .in('status', ['active', 'available', 'verfügbar']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: showAddDialog
  });

  // Mutation zum Zuweisen eines Fahrzeugs - hr_fleet_assignments
  const assignVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      // Hole company_id vom Employee
      const { data: emp } = await supabase
        .from('employees')
        .select('company_id')
        .eq('id', employeeId)
        .single();
      
      const { data, error } = await supabase
        .from('hr_fleet_assignments')
        .insert({
          employee_id: employeeId,
          vehicle_id: vehicleId,
          company_id: emp?.company_id,
          assigned_from: new Date().toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-vehicle-assignments', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['available-fleet-vehicles'] });
      toast.success('Fahrzeug erfolgreich zugewiesen');
      setShowAddDialog(false);
      setSelectedVehicleId("");
    },
    onError: (error: any) => {
      toast.error(`Fehler beim Zuweisen: ${error.message}`);
    }
  });

  const handleAssignVehicle = () => {
    if (!selectedVehicleId) {
      toast.error('Bitte wählen Sie ein Fahrzeug aus');
      return;
    }
    assignVehicleMutation.mutate(selectedVehicleId);
  };

  // Ermitteln ob Button angezeigt werden soll (Admin/HR oder allgemeine Employee-Berechtigung)
  const canAssignVehicle = canCreate('employee_fleet') || canCreate('employees') || canCreate('fleet');

  // Leerer Zustand
  if (!isLoading && vehicleAssignments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Fuhrpark</h2>
          {canAssignVehicle && (
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4" />
              Fahrzeug zuweisen
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Kein Firmenwagen zugewiesen</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Diesem Mitarbeiter ist derzeit kein Firmenwagen zugeordnet.
            </p>
            {canAssignVehicle && (
              <Button className="mt-6 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4" />
                Fahrzeug zuweisen
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Zuweisungs-Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fahrzeug zuweisen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Fahrzeug auswählen</Label>
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeug auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Keine verfügbaren Fahrzeuge
                      </SelectItem>
                    ) : (
                      availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleAssignVehicle} 
                  disabled={!selectedVehicleId || assignVehicleMutation.isPending}
                >
                  {assignVehicleMutation.isPending ? 'Wird zugewiesen...' : 'Zuweisen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Add-Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Fuhrpark</h2>
        {canAssignVehicle && (
          <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4" />
            Fahrzeug zuweisen
          </Button>
        )}
      </div>

      {/* Fahrzeugkarten */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicleAssignments.map((assignment: any) => (
          <Card key={assignment.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {assignment.vehicle?.brand} {assignment.vehicle?.model}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {assignment.vehicle?.license_plate}
                    </p>
                  </div>
                </div>
                <Badge variant={assignment.vehicle?.status === 'active' ? 'default' : 'secondary'}>
                  {assignment.vehicle?.status === 'active' ? 'Aktiv' : assignment.vehicle?.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Baujahr: {assignment.vehicle?.year || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  <span>{assignment.vehicle?.fuel_type || '-'}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Zugewiesen seit: {new Date(assignment.assigned_from).toLocaleDateString('de-DE')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Fahrzeugdaten werden aus dem Fuhrpark-Management geladen.</span>
          </div>
        </CardContent>
      </Card>

      {/* Zuweisungs-Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fahrzeug zuweisen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fahrzeug auswählen</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Fahrzeug auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Keine verfügbaren Fahrzeuge
                    </SelectItem>
                  ) : (
                    availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleAssignVehicle} 
                disabled={!selectedVehicleId || assignVehicleMutation.isPending}
              >
                {assignVehicleMutation.isPending ? 'Wird zugewiesen...' : 'Zuweisen'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
