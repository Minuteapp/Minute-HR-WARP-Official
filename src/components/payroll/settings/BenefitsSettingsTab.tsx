import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Gift, 
  Pencil,
  Trash2,
  Users,
  Euro,
  Inbox
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BenefitsSettingsTab = () => {
  const { data: benefits = [], isLoading } = useQuery({
    queryKey: ["payroll-benefits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_benefits")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  const activeBenefits = benefits.filter(b => b.is_active).length;
  const totalMonthlyCost = benefits.filter(b => b.is_active).reduce((sum, b) => sum + (b.monthly_cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Zusatzleistungen & Benefits</h2>
          <p className="text-sm text-muted-foreground">Verwalten Sie alle Mitarbeiter-Benefits und Zusatzleistungen</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Neue Leistung
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Gift className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktive Benefits</p>
                <p className="text-2xl font-bold text-foreground">{activeBenefits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Euro className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kosten/Monat</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalMonthlyCost > 0 ? `€${(totalMonthlyCost / 1000).toFixed(0)}k` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Konfiguriert</p>
                <p className="text-2xl font-bold text-purple-600">{benefits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Table */}
      <Card className="border bg-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lade Benefits...</div>
          ) : benefits.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Keine Benefits konfiguriert</p>
              <p className="text-sm text-muted-foreground mt-1">
                Erstellen Sie Ihre erste Zusatzleistung
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Leistung</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wert</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Typ</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Kosten/Monat</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {benefits.map((benefit) => (
                    <tr key={benefit.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Gift className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{benefit.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{benefit.value || "—"}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="font-normal">
                          {benefit.type || "Sonstige"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-medium text-foreground">
                        {benefit.monthly_cost ? `€${benefit.monthly_cost.toLocaleString()}` : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <Switch checked={benefit.is_active} disabled />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
