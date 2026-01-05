import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BenefitsSectionProps {
  employee: Employee | null;
  isEditing: boolean;
}

interface Benefit {
  name: string;
  provider?: string;
  value?: string;
  since?: string;
  status?: string;
}

export const BenefitsSection = ({ employee, isEditing }: BenefitsSectionProps) => {
  // Lade Benefits aus der employees-Tabelle (benefits JSONB-Spalte)
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee-benefits', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('benefits')
        .eq('id', employee.id)
        .single();
      
      if (error) {
        console.error('Fehler beim Laden der Benefits:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!employee?.id,
  });

  // Parse benefits aus JSONB
  const benefits: Benefit[] = employeeData?.benefits 
    ? (Array.isArray(employeeData.benefits) 
        ? employeeData.benefits.map((benefit: any) => ({
            name: benefit.name || 'Unbekannter Benefit',
            provider: benefit.provider || null,
            value: benefit.value || null,
            since: benefit.since || benefit.start_date || null,
            status: benefit.status || 'active',
          }))
        : [])
    : [];

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Benefits & Vergünstigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Benefits & Vergünstigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {benefits.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Gift className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Benefits zugewiesen</p>
          </div>
        ) : (
          benefits.map((benefit, index) => (
            <div key={index} className="p-3 border rounded-lg bg-green-50/30">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{benefit.name}</h4>
                  {benefit.provider && (
                    <p className="text-xs text-muted-foreground">Anbieter: {benefit.provider}</p>
                  )}
                </div>
                <Badge 
                  variant="default" 
                  className={`text-xs ${benefit.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}
                >
                  {benefit.status === 'active' ? 'aktiv' : benefit.status || 'aktiv'}
                </Badge>
              </div>
              <div className={`grid ${benefit.value ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-xs`}>
                {benefit.value && (
                  <div>
                    <p className="text-muted-foreground">Wert</p>
                    <p className="font-medium">{benefit.value}</p>
                  </div>
                )}
                {benefit.since && (
                  <div>
                    <p className="text-muted-foreground">Seit</p>
                    <p className="font-medium">{benefit.since}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
