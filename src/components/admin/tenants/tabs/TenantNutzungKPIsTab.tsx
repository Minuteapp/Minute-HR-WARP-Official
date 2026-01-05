import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, FileQuestion, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TenantNutzungKPIsTabProps {
  tenantId?: string;
}

export const TenantNutzungKPIsTab = ({ tenantId }: TenantNutzungKPIsTabProps) => {
  // Echte Daten laden
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['tenant-kpis', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      // Aktive Mitarbeiter zählen
      const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .eq('status', 'active')
        .or('archived.is.null,archived.eq.false');

      // Gesamte Mitarbeiter zählen
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .or('archived.is.null,archived.eq.false');

      // Projekte zählen
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId);

      // Aktive Module zählen (Spalte heißt is_enabled, nicht is_active)
      const { count: moduleCount } = await supabase
        .from('company_module_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .eq('is_enabled', true);

      return {
        activeEmployees: activeEmployees || 0,
        totalEmployees: totalEmployees || 0,
        projectCount: projectCount || 0,
        moduleCount: moduleCount || 0
      };
    },
    enabled: !!tenantId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { 
      label: "Aktive Nutzer", 
      value: kpiData?.activeEmployees?.toString() || "0", 
      change: `von ${kpiData?.totalEmployees || 0} gesamt`, 
      icon: Users 
    },
    { 
      label: "Projekte", 
      value: kpiData?.projectCount?.toString() || "0", 
      change: "Gesamt", 
      icon: FolderKanban 
    },
    { 
      label: "Aktive Module", 
      value: kpiData?.moduleCount?.toString() || "0", 
      change: "Aktiviert", 
      icon: FileQuestion 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{kpi.change}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Nutzungsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Mitarbeiter mit Login</p>
              <p className="text-xl font-semibold mt-1">
                {kpiData?.activeEmployees || 0} / {kpiData?.totalEmployees || 0}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Auslastung</p>
              <p className="text-xl font-semibold mt-1">
                {kpiData?.totalEmployees ? Math.round((kpiData.activeEmployees / kpiData.totalEmployees) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
