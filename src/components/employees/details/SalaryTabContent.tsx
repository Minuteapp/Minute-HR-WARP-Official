import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  Download, 
  FileText,
  Shield,
  Award,
  AlertCircle,
  Target
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface SalaryTabContentProps {
  employeeId: string;
}

export const SalaryTabContent = ({ employeeId }: SalaryTabContentProps) => {
  // Fetch employee salary data
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee-salary', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('salary_amount, salary_currency, bonus_eligible, benefits, employment_type')
        .eq('id', employeeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  // Fetch payslips from employee_documents
  const { data: payslips = [], isLoading: payslipsLoading } = useQuery({
    queryKey: ['employee-payslips', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('id, file_name, file_size, created_at')
        .eq('employee_id', employeeId)
        .eq('category', 'payslip')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Fetch payroll records for salary history
  const { data: payrollRecords = [], isLoading: payrollLoading } = useQuery({
    queryKey: ['employee-payroll-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('pay_period_start', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  const isLoading = employeeLoading || payslipsLoading || payrollLoading;

  if (isLoading) {
    return (
      <div className="bg-background p-6 rounded-lg border shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const grossSalary = employee?.salary_amount || 0;
  const netSalary = Math.round(grossSalary * 0.6); // Approximate net (60% of gross)
  const currency = employee?.salary_currency || 'EUR';

  // Build salary development data from payroll records
  const salaryDevelopmentData = payrollRecords.length > 0
    ? payrollRecords.map(record => ({
        month: format(new Date(record.pay_period_start), 'MMM yyyy', { locale: de }),
        brutto: record.gross_salary || grossSalary,
        netto: record.net_salary || netSalary,
      })).reverse()
    : [
        { month: 'Aktuell', brutto: grossSalary, netto: netSalary },
      ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasSalaryData = grossSalary > 0;

  return (
    <div className="bg-background p-6 rounded-lg border shadow-sm space-y-6">
      {/* Top Section - Current Compensation & Development */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Compensation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Aktuelle Vergütung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasSalaryData ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine Gehaltsdaten vorhanden</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Brutto-Gehalt</p>
                    <p className="text-2xl font-bold">{formatCurrency(grossSalary)}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Netto-Gehalt (ca.)</p>
                    <p className="text-2xl font-bold">{formatCurrency(netSalary)}</p>
                  </div>
                </div>

                {employee?.bonus_eligible && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bonus (variabel)</p>
                      <Badge variant="secondary">Bonus-berechtigt</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Beschäftigungsart</p>
                      <p className="text-sm font-medium">{employee?.employment_type || '-'}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Salary Development Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gehaltsentwicklung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salaryDevelopmentData.length <= 1 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine historischen Daten vorhanden</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salaryDevelopmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="brutto" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Brutto"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netto" 
                      stroke="hsl(142 76% 36%)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Netto"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payslips Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lohnabrechnungen
            </CardTitle>
            {payslips.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-3 w-3" />
                Alle herunterladen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {payslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Lohnabrechnungen vorhanden</p>
            </div>
          ) : (
            payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{payslip.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(payslip.file_size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Footer Status Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-green-600" />
          <span>DSGVO-konform</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="h-3 w-3 text-blue-600" />
          <span>ISO 27001 zertifiziert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-red-600" />
          <span>Alle Änderungen werden protokolliert</span>
        </div>
      </div>
    </div>
  );
};
