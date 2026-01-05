import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DriversLicenseSectionProps {
  employee: Employee | null;
  isEditing: boolean;
}

export const DriversLicenseSection = ({ employee, isEditing }: DriversLicenseSectionProps) => {
  // Lade Führerscheindaten aus der employees-Tabelle
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee-drivers-license', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('driver_license_class, driver_license_number, driver_license_issued, driver_license_valid_until, driver_license_authority')
        .eq('id', employee.id)
        .single();
      
      if (error) {
        console.error('Fehler beim Laden der Führerscheindaten:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!employee?.id,
  });

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Car className="h-4 w-4" />
            Führerschein & Lizenzen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasLicense = employeeData?.driver_license_class;

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Car className="h-4 w-4" />
          Führerschein & Lizenzen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasLicense ? (
          <div className="text-center py-6 text-muted-foreground">
            <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Kein Führerschein hinterlegt</p>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Führerschein</h4>
              <Badge variant="default" className="text-xs bg-green-600">
                Gültig
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Kategorie</p>
                <p className="font-medium">{employeeData.driver_license_class}</p>
              </div>
              {employeeData.driver_license_number && (
                <div>
                  <p className="text-muted-foreground">Nummer</p>
                  <p className="font-medium">{employeeData.driver_license_number}</p>
                </div>
              )}
              {employeeData.driver_license_issued && (
                <div>
                  <p className="text-muted-foreground">Ausgestellt</p>
                  <p className="font-medium">{employeeData.driver_license_issued}</p>
                </div>
              )}
              {employeeData.driver_license_authority && (
                <div>
                  <p className="text-muted-foreground">Behörde</p>
                  <p className="font-medium">{employeeData.driver_license_authority}</p>
                </div>
              )}
              {employeeData.driver_license_valid_until && (
                <div>
                  <p className="text-muted-foreground">Gültig bis</p>
                  <p className="font-medium">{employeeData.driver_license_valid_until}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
