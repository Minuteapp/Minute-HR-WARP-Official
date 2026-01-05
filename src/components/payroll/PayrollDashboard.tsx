import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Settings, LayoutDashboard, Receipt, BarChart3, UserCircle, ShieldCheck, DollarSign
} from "lucide-react";
import { PayrollHeader } from "./overview/PayrollHeader";
import { KIInsightsSection, PayrollInsight } from "./overview/KIInsightsSection";
import { ActionButtons } from "./overview/ActionButtons";
import { PayrollKPICards } from "./overview/PayrollKPICards";
import { DepartmentCostsTable, DepartmentCost } from "./overview/DepartmentCostsTable";
import { RecentRunsSidebar, PayrollRun } from "./overview/RecentRunsSidebar";
import { KIInsightsDialog } from "./overview/KIInsightsDialog";
import { OpenIssuesDialog, PayrollOpenIssue } from "./overview/OpenIssuesDialog";
import { PayrollEmployeesTab } from "./employees/PayrollEmployeesTab";
import { PayrollProcessingTab } from "./processing/PayrollProcessingTab";
import { PayrollReportsTab } from "./reports/PayrollReportsTab";
import { PayrollSettingsTab } from "./settings/PayrollSettingsTab";
import EmployeePayrollView from "./employee-view/EmployeePayrollView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveRole } from "@/hooks/useEffectiveRole";
import { useOriginalRole } from "@/hooks/useOriginalRole";
import { usePermissionContext } from "@/contexts/PermissionContext";

export const PayrollDashboard = () => {
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [showIssuesDialog, setShowIssuesDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  // Effektive Rolle aus dem System (berücksichtigt Impersonation)
  const { isHROrAdmin, loading: roleLoading } = useEffectiveRole();
  const { isOriginalSuperAdmin } = useOriginalRole();
  
  // KRITISCH: Rechtematrix für Payroll-Modul
  const { hasPermission, loading: permissionLoading } = usePermissionContext();
  
  // Prüfe ob User Admin-Rechte im Payroll-Modul hat (edit, create, delete)
  const hasPayrollAdminPermission = useMemo(() => {
    return hasPermission('payroll', 'edit') || 
           hasPermission('payroll', 'create') || 
           hasPermission('payroll', 'delete');
  }, [hasPermission]);
  
  // Nur SuperAdmins können die Ansicht manuell überschreiben
  const [manualViewOverride, setManualViewOverride] = useState<"admin" | "employee" | null>(null);
  
  // Bestimme den View-Mode basierend auf der RECHTEMATRIX (nicht mehr auf isHROrAdmin)
  const viewMode = useMemo((): "admin" | "employee" => {
    if (isOriginalSuperAdmin && manualViewOverride) {
      return manualViewOverride;
    }
    // KRITISCH: Verwende hasPayrollAdminPermission statt isHROrAdmin
    return hasPayrollAdminPermission ? "admin" : "employee";
  }, [isOriginalSuperAdmin, manualViewOverride, hasPayrollAdminPermission]);

  // Mitarbeiter-Anzahl aus DB
  const { data: employeeCount, isLoading } = useQuery({
    queryKey: ["payroll-employee-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      return count ?? 0;
    }
  });

  // Payroll Insights aus DB
  const { data: dbInsights } = useQuery({
    queryKey: ["payroll-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_insights")
        .select("*")
        .order("priority", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Abteilungskosten aus DB
  const { data: dbDepartments } = useQuery({
    queryKey: ["payroll-department-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_department_costs")
        .select("*")
        .order("total_costs", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Payroll Runs aus DB
  const { data: dbRuns } = useQuery({
    queryKey: ["payroll-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Offene Issues aus DB
  const { data: dbIssues } = useQuery({
    queryKey: ["payroll-open-issues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_open_issues")
        .select("*")
        .eq("status", "open")
        .order("severity", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Konvertiere DB-Daten zu erwarteten Formaten
  const insights: PayrollInsight[] = (dbInsights || []).map((i: any) => ({
    id: i.id,
    priority: i.priority || "info",
    title: i.title,
    description: i.description,
    affected_count: i.affected_count,
    action_label: i.action_label || "Details"
  }));

  const departments: DepartmentCost[] = (dbDepartments || []).map((d: any) => ({
    id: d.id,
    department: d.department,
    employeeCount: d.employee_count || 0,
    totalCosts: d.total_costs || 0,
    averageCostPerEmployee: d.average_cost_per_employee || 0,
    trendPercentage: d.trend_percentage || 0
  }));

  const runs: PayrollRun[] = (dbRuns || []).map((r: any) => ({
    id: r.id,
    runType: r.run_type || "monthly",
    payrollPeriod: r.payroll_period,
    status: r.status,
    employeeCount: r.employee_count || 0,
    totalGross: r.total_gross || 0,
    completedAt: r.completed_at
  }));

  const issues: PayrollOpenIssue[] = (dbIssues || []).map((i: any) => ({
    id: i.id,
    employeeId: i.employee_id,
    employeeName: i.employee_name,
    department: i.department,
    issueType: i.issue_type,
    severity: i.severity,
    title: i.title,
    description: i.description
  }));

  const safeEmployeeCount = employeeCount ?? 0;
  const totalCosts = runs.length > 0 ? runs[0].totalGross : 0;
  const openIssuesCount = issues.length;
  const avgCost = safeEmployeeCount > 0 ? totalCosts / safeEmployeeCount : 0;
  const departmentNames = departments.map(d => d.department);

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Lohn & Gehalt</h1>
              <p className="text-sm text-muted-foreground">Gehaltsabrechnung und Personalkosten</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Ansichts-Switcher nur für SuperAdmins */}
            {isOriginalSuperAdmin && (
              <>
                <span className="text-sm text-muted-foreground">Ansicht:</span>
                <Select value={viewMode} onValueChange={(value: "admin" | "employee") => setManualViewOverride(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>HR / Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="employee">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-blue-600" />
                        <span>Mitarbeiter</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {viewMode === "employee" ? (
          <EmployeePayrollView />
        ) : (
          <>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Übersicht
                </TabsTrigger>
                <TabsTrigger 
                  value="employees" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Mitarbeiter
                </TabsTrigger>
                <TabsTrigger 
                  value="processing" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Abrechnung
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Berichte
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Einstellungen
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {insights.length > 0 && (
                  <KIInsightsSection 
                    insights={insights} 
                    onViewAll={() => setShowInsightsDialog(true)} 
                  />
                )}
                <ActionButtons 
                  openIssuesCount={openIssuesCount}
                  departments={departmentNames}
                  selectedDepartment={selectedDepartment}
                  onDepartmentChange={setSelectedDepartment}
                  onNewPayroll={() => {}}
                  onOpenIssues={() => setShowIssuesDialog(true)}
                  onDatevExport={() => {}}
                  onMonthlyReport={() => {}}
                />
                <PayrollKPICards 
                  employeeCount={safeEmployeeCount}
                  totalCosts={totalCosts}
                  openIssuesCount={openIssuesCount}
                  averageCostPerEmployee={avgCost}
                  costTrend={{ value: "0%", isPositive: true }}
                  isLoading={isLoading}
                />
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <DepartmentCostsTable departments={departments} />
                  </div>
                  <div>
                    <RecentRunsSidebar runs={runs} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employees" className="mt-6">
                <PayrollEmployeesTab />
              </TabsContent>

              <TabsContent value="processing" className="mt-6">
                <PayrollProcessingTab />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <PayrollReportsTab />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <PayrollSettingsTab />
              </TabsContent>
            </Tabs>

            <KIInsightsDialog 
              open={showInsightsDialog} 
              onOpenChange={setShowInsightsDialog}
              insights={insights}
            />
            <OpenIssuesDialog 
              open={showIssuesDialog} 
              onOpenChange={setShowIssuesDialog}
              issues={issues}
            />
          </>
        )}
      </div>
    </div>
  );
};