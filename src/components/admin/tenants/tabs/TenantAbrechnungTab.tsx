import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface TenantAbrechnungTabProps {
  tenantId?: string;
}

// Abrechnungsdaten würden typischerweise aus einer separaten Billing-Tabelle kommen
export const TenantAbrechnungTab = ({ tenantId }: TenantAbrechnungTabProps) => {
  const financialKpis = [
    { label: "MRR (Monatsumsatz)", value: "-", icon: DollarSign },
    { label: "ARR (Jahresumsatz)", value: "-", icon: TrendingUp },
    { label: "Offene Beträge", value: "€0", icon: AlertCircle, isGreen: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {financialKpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpi.isGreen ? "text-green-600" : ""}`}>{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.isGreen ? "bg-green-100" : "bg-primary/10"}`}>
                    <Icon className={`w-5 h-5 ${kpi.isGreen ? "text-green-600" : "text-primary"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Rechnungen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnungs-Nr.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bezahlt am</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine Rechnungen vorhanden. Billing-Integration erforderlich.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};