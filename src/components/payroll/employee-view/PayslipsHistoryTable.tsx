import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Eye, Download, DownloadCloud, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const PayslipsHistoryTable = () => {
  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ["payslips-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("auth_uid", user.id)
        .single();
      
      if (!employee) return [];

      const { data, error } = await supabase
        .from("payslips")
        .select("*")
        .eq("employee_id", employee.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data || [];
    }
  });

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatMonth = (year: number | null, month: number | null) => {
    if (!year || !month) return "—";
    const date = new Date(year, month - 1);
    return format(date, "MMM yy", { locale: de });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd.MM.yy", { locale: de });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Lohnabrechnungen</CardTitle>
          </div>
          {payslips.length > 0 && (
            <Button variant="outline" size="sm">
              <DownloadCloud className="h-4 w-4 mr-2" />
              Alle herunterladen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Lade Abrechnungen...
          </div>
        ) : payslips.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Noch keine Abrechnungen vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ihre Lohnabrechnungen werden hier aufgelistet
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monat</TableHead>
                <TableHead>Brutto</TableHead>
                <TableHead>Netto</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Hinweis</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">
                    {formatMonth(payslip.year, payslip.month)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(payslip.gross_amount)}
                  </TableCell>
                  <TableCell className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(payslip.net_amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(payslip.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payslip.note || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PayslipsHistoryTable;