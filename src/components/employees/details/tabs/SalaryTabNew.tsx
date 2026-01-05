import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ComplianceFooter } from '@/components/employees/profile/sections/ComplianceFooter';
import { EditableField } from '@/components/employees/shared/EditableField';
import { EmployeeTabEditProps } from '@/types/employee-tab-props.types';
import { 
  DollarSign, 
  TrendingUp, 
  FileText,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SalaryTabNewProps extends EmployeeTabEditProps {}

export const SalaryTabNew = ({ 
  employeeId, 
  isEditing = false, 
  onFieldChange, 
  pendingChanges 
}: SalaryTabNewProps) => {
  
  // Fetch employee salary data
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee-salary-new', employeeId],
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
    queryKey: ['employee-payslips-new', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('id, file_name, file_size, created_at')
        .eq('employee_id', employeeId)
        .eq('category', 'payslip')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Fetch salary history from employee_salary_history (korrekte Tabelle)
  const { data: salaryHistory = [], isLoading: payrollLoading } = useQuery({
    queryKey: ['employee-salary-history-new', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_salary_history')
        .select('*')
        .eq('employee_id', employeeId)
        .order('effective_date', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Get current values (from pendingChanges or database)
  const getValue = (field: string, defaultValue: any) => {
    if (pendingChanges?.salary?.[field] !== undefined) {
      return pendingChanges.salary[field];
    }
    if (employee) {
      switch (field) {
        case 'brutto': return employee.salary_amount || defaultValue;
        case 'netto': return Math.round((employee.salary_amount || 0) * 0.6);
        default: return defaultValue;
      }
    }
    return defaultValue;
  };

  const handleChange = (field: string, value: any) => {
    onFieldChange?.('salary', field, value);
  };

  const isLoading = employeeLoading || payslipsLoading || payrollLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  const grossSalary = getValue('brutto', 0);
  const netSalary = getValue('netto', 0);
  const currency = employee?.salary_currency || 'EUR';
  const hasSalaryData = grossSalary > 0;

  // Build salary development data from salary history
  const salaryDevelopmentData = salaryHistory.length > 0
    ? salaryHistory.map((record: any) => ({
        month: format(new Date(record.effective_date), 'MMM yy', { locale: de }),
        salary: record.salary_amount || grossSalary,
      })).reverse()
    : hasSalaryData 
      ? [{ month: 'Aktuell', salary: grossSalary }]
      : [];

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Row: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktuelle Vergütung */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Aktuelle Vergütung</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasSalaryData && !isEditing ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine Gehaltsdaten vorhanden</p>
              </div>
            ) : (
              <>
                {/* Brutto/Netto Boxes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <EditableField
                      label="Brutto-Gehalt"
                      value={grossSalary}
                      isEditing={isEditing}
                      onChange={(val) => handleChange('brutto', val)}
                      type="currency"
                      suffix=" €"
                      labelClassName="text-xs text-muted-foreground mb-1"
                      valueClassName="text-xl font-bold"
                    />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <EditableField
                      label="Netto-Gehalt"
                      value={netSalary}
                      isEditing={isEditing}
                      onChange={(val) => handleChange('netto', val)}
                      type="currency"
                      suffix=" €"
                      labelClassName="text-xs text-muted-foreground mb-1"
                      valueClassName="text-xl font-bold"
                    />
                  </div>
                </div>

                {/* Zusätzliche Leistungen */}
                {employee?.bonus_eligible && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Zusätzliche Leistungen</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        <span>Bonus-berechtigt</span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Gehaltsentwicklung */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Gehaltsentwicklung</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {salaryDevelopmentData.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Keine historischen Daten</p>
              </div>
            ) : (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salaryDevelopmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString('de-DE')} €`, 'Gehalt']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey="salary" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lohnabrechnungen */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Lohnabrechnungen</CardTitle>
            </div>
            {payslips.length > 0 && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Alle herunterladen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Keine Lohnabrechnungen vorhanden</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payslips.map((payslip) => (
                <div 
                  key={payslip.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">{payslip.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(payslip.file_size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ComplianceFooter */}
      <ComplianceFooter />
    </div>
  );
};
