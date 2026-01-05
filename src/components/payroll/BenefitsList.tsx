
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Briefcase, Package } from "lucide-react";
import { usePayrollData } from "@/hooks/usePayrollData";
import { useToast } from "@/hooks/use-toast";

export function BenefitsList() {
  const { benefits, isLoading } = usePayrollData();

  const getBenefitIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'pension':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: "default", label: "Aktiv" },
      inactive: { variant: "secondary", label: "Inaktiv" },
      pending: { variant: "outline", label: "Ausstehend" },
      archived: { variant: "destructive", label: "Archiviert" }
    };

    const { variant, label } = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount: number | undefined, currency: string) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Zusatzleistungen...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zusatzleistungen & Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {benefits?.map((benefit) => (
            <div key={benefit.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
              <div className="flex items-center space-x-4">
                 <div className="p-2 rounded-full bg-primary/10">
                   {getBenefitIcon(benefit.benefit_type)}
                 </div>
                <div>
                  <p className="font-medium">{benefit.name}</p>
                  {benefit.description && (
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {benefit.monetary_value && (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(benefit.monetary_value, benefit.currency)}
                  </span>
                )}
                {getStatusBadge(benefit.status)}
              </div>
            </div>
          ))}

          {(!benefits || benefits.length === 0) && (
            <div className="text-center text-muted-foreground p-8">
              Keine Zusatzleistungen gefunden
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
