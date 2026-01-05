import { Card, CardContent } from "@/components/ui/card";
import { Euro, TrendingUp, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EmployeeKPICards = () => {
  const currentYear = new Date().getFullYear();

  const { data: employeeData } = useQuery({
    queryKey: ["employee-payroll-kpis", currentYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: employee } = await supabase
        .from("employees")
        .select("id, vacation_days")
        .eq("auth_uid", user.id)
        .single();
      
      if (!employee) return null;

      // Fetch all payslips for current year to calculate YTD
      const { data: payslips } = await supabase
        .from("payslips")
        .select("gross_amount, net_amount, year")
        .eq("employee_id", employee.id)
        .eq("year", currentYear);

      // Calculate YTD totals
      const ytdGross = payslips?.reduce((sum, p) => sum + (p.gross_amount || 0), 0) || 0;
      const ytdNet = payslips?.reduce((sum, p) => sum + (p.net_amount || 0), 0) || 0;

      // Fetch overtime hours (if available in time_entries)
      const { data: timeEntries } = await supabase
        .from("time_entries")
        .select("overtime_hours")
        .eq("employee_id", employee.id)
        .gte("date", `${currentYear}-01-01`)
        .lte("date", `${currentYear}-12-31`);

      const totalOvertime = timeEntries?.reduce((sum, t) => sum + (t.overtime_hours || 0), 0) || 0;

      return {
        vacationDays: employee.vacation_days,
        ytdGross,
        ytdNet,
        overtimeHours: totalOvertime
      };
    }
  });

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return "—";
    return `${hours}h`;
  };

  const kpis = [
    {
      icon: Euro,
      value: employeeData ? formatCurrency(employeeData.ytdGross) : "—",
      label: "Brutto YTD",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      valueColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: TrendingUp,
      value: employeeData ? formatCurrency(employeeData.ytdNet) : "—",
      label: "Netto YTD",
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      valueColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: Calendar,
      value: employeeData?.vacationDays !== null && employeeData?.vacationDays !== undefined 
        ? String(employeeData.vacationDays) 
        : "—",
      label: "Urlaubstage übrig",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Clock,
      value: employeeData ? formatHours(employeeData.overtimeHours) : "—",
      label: "Überstunden",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      valueColor: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeKPICards;