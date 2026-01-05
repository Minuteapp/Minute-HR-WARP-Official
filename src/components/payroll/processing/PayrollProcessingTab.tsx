import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Play, FileText, Download, CheckCircle, Clock, 
  Users, Euro, Calendar, TrendingUp, TrendingDown,
  Eye, ChevronRight, AlertCircle, FileCheck, Inbox
} from "lucide-react";
import { NewPayrollDialog } from "./NewPayrollDialog";
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

const processSteps = [
  { id: 1, label: "Daten prüfen", icon: FileCheck, completed: false, current: false },
  { id: 2, label: "Berechnung", icon: Euro, completed: false, current: false },
  { id: 3, label: "Freigabe", icon: CheckCircle, completed: false, current: false },
  { id: 4, label: "Export", icon: Download, completed: false, current: false },
];

export const PayrollProcessingTab = () => {
  const [showNewPayrollDialog, setShowNewPayrollDialog] = useState(false);

  const { data: employeeCount = 0 } = useQuery({
    queryKey: ["employee-count-processing"],
    queryFn: async () => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count || 0;
    }
  });

  const { data: payrollRuns = [], isLoading } = useQuery({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  const currentRun = payrollRuns.length > 0 ? payrollRuns[0] : null;
  const historyRuns = payrollRuns.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Lohnabrechnung</h2>
          <p className="text-muted-foreground">Verwalten Sie Ihre monatlichen Abrechnungsläufe</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            DATEV Export
          </Button>
          <Button onClick={() => setShowNewPayrollDialog(true)}>
            <Play className="h-4 w-4 mr-2" />
            Neue Abrechnung
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Run Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Aktueller Lauf</CardTitle>
                  <CardDescription>
                    {currentRun ? currentRun.period_name || currentRun.period : "Kein aktiver Lauf"}
                  </CardDescription>
                </div>
                {currentRun ? (
                  <Badge className={
                    currentRun.status === 'completed' 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }>
                    {currentRun.status === 'completed' ? (
                      <><CheckCircle className="h-3 w-3 mr-1" />Abgeschlossen</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" />In Bearbeitung</>
                    )}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentRun ? (
                <>
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{currentRun.employee_count || employeeCount}</div>
                      <div className="text-sm text-muted-foreground">Mitarbeiter</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {currentRun.due_date ? formatDate(currentRun.due_date) : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">Fällig am</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {currentRun.total_amount ? formatCurrency(currentRun.total_amount) : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">Betrag</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fortschritt</span>
                      <span className="text-muted-foreground">{currentRun.progress || 0}%</span>
                    </div>
                    <Progress value={currentRun.progress || 0} className="h-2" />
                  </div>

                  {/* Process Steps */}
                  <div className="flex items-center justify-between">
                    {processSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                            <step.icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs mt-2 text-muted-foreground">
                            {step.label}
                          </span>
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="h-0.5 w-16 mx-2 bg-muted" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Vorschau
                    </Button>
                    <Button className="flex-1">
                      Fortfahren
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Kein aktiver Abrechnungslauf vorhanden</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Starten Sie eine neue Abrechnung, um fortzufahren
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Übersicht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Aktive Mitarbeiter</span>
              <span className="font-semibold">{employeeCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Abrechnungsläufe</span>
              <span className="font-semibold">{payrollRuns.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Abgeschlossen</span>
              <span className="font-semibold text-emerald-600">
                {payrollRuns.filter(r => r.status === 'completed').length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">In Bearbeitung</span>
              <span className="font-semibold text-amber-600">
                {payrollRuns.filter(r => r.status !== 'completed').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abrechnungshistorie</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Lade Daten...</div>
          ) : historyRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine historischen Abrechnungsläufe vorhanden
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Mitarbeiter</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Abgeschlossen</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.period_name || run.period}</TableCell>
                    <TableCell>
                      <Badge className={
                        run.status === 'completed'
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }>
                        {run.status === 'completed' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" />Abgeschlossen</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" />In Bearbeitung</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{run.employee_count || "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {run.total_amount ? formatCurrency(run.total_amount) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {run.completed_at ? formatDate(run.completed_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bottom KPI Cards - Only show if we have data */}
      {payrollRuns.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ø Kosten pro MA</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeCount > 0 && payrollRuns[0]?.total_amount 
                  ? formatCurrency(payrollRuns[0].total_amount / employeeCount)
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Basierend auf letztem Lauf</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payrollRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0) > 0
                  ? formatCurrency(payrollRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0))
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Alle Läufe</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Läufe</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollRuns.length}</div>
              <p className="text-xs text-muted-foreground">Insgesamt</p>
            </CardContent>
          </Card>
        </div>
      )}

      <NewPayrollDialog 
        open={showNewPayrollDialog} 
        onOpenChange={setShowNewPayrollDialog} 
      />
    </div>
  );
};
