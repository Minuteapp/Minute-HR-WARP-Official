import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CurrentPayslipCard = () => {
  const { data: latestPayslip, isLoading } = useQuery({
    queryKey: ["current-payslip"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("auth_uid", user.id)
        .single();
      
      if (!employee) return null;

      const { data: payslip } = await supabase
        .from("payslips")
        .select("*")
        .eq("employee_id", employee.id)
        .order("period_end", { ascending: false })
        .limit(1)
        .single();
      
      return payslip;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Aktuelle Abrechnung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Lade Daten...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestPayslip) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Aktuelle Abrechnung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Keine Abrechnung verfügbar</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ihre Abrechnungen werden hier angezeigt
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Determine period display - use period_name or construct from year/month
  const periodDisplay = latestPayslip.period_name || 
    (latestPayslip.year && latestPayslip.month 
      ? format(new Date(latestPayslip.year, latestPayslip.month - 1), "MMMM yyyy", { locale: de })
      : "—");

  // Determine status - check if payslip is finalized
  const isFinalized = latestPayslip.status === 'finalized' || latestPayslip.status === 'paid';
  const statusLabel = isFinalized ? "Freigegeben" : "In Bearbeitung";
  const statusVariant = isFinalized ? "default" : "secondary";

  // Format expected release date
  const expectedReleaseDate = latestPayslip.expected_release_date 
    ? format(new Date(latestPayslip.expected_release_date), "dd.MM.yy", { locale: de })
    : null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Aktuelle Abrechnung</CardTitle>
          </div>
          <Badge variant={statusVariant} className={isFinalized ? "bg-green-100 text-green-700" : ""}>
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{periodDisplay}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Brutto</p>
            <p className="text-2xl font-bold">
              {formatCurrency(latestPayslip.gross_amount)}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Netto</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(latestPayslip.net_amount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Steuern</p>
            <p className="text-xl font-semibold">
              {formatCurrency(latestPayslip.taxes)}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Sozialabgaben</p>
            <p className="text-xl font-semibold">
              {formatCurrency(latestPayslip.social_contributions)}
            </p>
          </div>
        </div>

        {!isFinalized && expectedReleaseDate && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Verfügbar nach Freigabe (voraussichtlich {expectedReleaseDate})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentPayslipCard;