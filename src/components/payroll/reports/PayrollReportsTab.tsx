import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, Euro, Users,
  FileText, BarChart3, Inbox
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const quickReports = [
  { id: 1, name: "Lohnjournal", description: "Detaillierte Lohnübersicht", icon: FileText },
  { id: 2, name: "SV-Meldungen", description: "Sozialversicherung", icon: Users },
  { id: 3, name: "Lohnsteuer", description: "Steuerübersicht", icon: Euro },
  { id: 4, name: "Kostenstellenreport", description: "Nach Abteilung", icon: BarChart3 },
];

export const PayrollReportsTab = () => {
  const [selectedMonth, setSelectedMonth] = useState("aktuell");

  const { data: employeeCount = 0 } = useQuery({
    queryKey: ["employee-count-reports"],
    queryFn: async () => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count || 0;
    }
  });

  const { data: payrollRuns = [] } = useQuery({
    queryKey: ["payroll-runs-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    }
  });

  const totalAmount = payrollRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const avgPerEmployee = employeeCount > 0 && totalAmount > 0 
    ? totalAmount / employeeCount / payrollRuns.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Berichte & Analytics</h2>
          <p className="text-muted-foreground">Auswertungen und Statistiken zur Lohnabrechnung</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Zeitraum wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aktuell">Aktueller Monat</SelectItem>
              <SelectItem value="letzter">Letzter Monat</SelectItem>
              <SelectItem value="quartal">Letztes Quartal</SelectItem>
              <SelectItem value="jahr">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtkosten</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount > 0 ? formatCurrency(totalAmount) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Alle erfassten Läufe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ø Kosten pro MA</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgPerEmployee > 0 ? formatCurrency(avgPerEmployee) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Pro Monat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Abrechnungsläufe</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollRuns.length}</div>
            <p className="text-xs text-muted-foreground">Erfasst</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-xs text-muted-foreground">Aktiv</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Lohnkostenentwicklung</CardTitle>
            </div>
            <CardDescription>Monatliche Gesamtkosten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {payrollRuns.length > 0 ? (
                <p className="text-muted-foreground">
                  Diagramm basierend auf {payrollRuns.length} Abrechnungsläufen
                </p>
              ) : (
                <div className="text-center">
                  <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Keine Daten für Diagramm verfügbar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Kostenverteilung</CardTitle>
            </div>
            <CardDescription>Aufteilung der Lohnkosten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <div className="text-center">
                <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Keine Detaildaten verfügbar</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Kostenverteilung wird nach Abrechnungsläufen berechnet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Schnellberichte</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {quickReports.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
