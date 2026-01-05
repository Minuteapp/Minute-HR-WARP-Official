
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { FileText, Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { usePayrollData } from "@/hooks/usePayrollData";

export function PayslipsList() {
  const { toast } = useToast();
  const { payslips, isLoading, stats } = usePayrollData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      draft: { variant: "secondary", label: "Entwurf" },
      pending: { variant: "outline", label: "Ausstehend" },
      approved: { variant: "default", label: "Genehmigt" },
      archived: { variant: "outline", label: "Archiviert" },
      deleted: { variant: "destructive", label: "Gelöscht" }
    };

    const { variant, label } = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return format(new Date(2024, month - 1, 1), 'MMMM', { locale: de });
  };

  const downloadPayslip = async (documentPath: string | null) => {
    if (!documentPath) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Keine Datei zum Herunterladen verfügbar."
      });
      return;
    }

    // Here you would implement the actual download logic using Supabase Storage
    toast({
      title: "Download gestartet",
      description: "Ihre Gehaltsabrechnung wird heruntergeladen."
    });
  };

  const filteredPayslips = payslips?.filter(payslip => {
    const matchesSearch = searchTerm === "" || 
      `${getMonthName(payslip.month)} ${payslip.year}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(payslip.status);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Lade Gehaltsabrechnungen...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gehaltsabrechnungen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className="pl-9"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('approved')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'approved']
                        : prev.filter(s => s !== 'approved')
                    );
                  }}
                >
                  Genehmigt
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('pending')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'pending']
                        : prev.filter(s => s !== 'pending')
                    );
                  }}
                >
                  Ausstehend
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes('archived')}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, 'archived']
                        : prev.filter(s => s !== 'archived')
                    );
                  }}
                >
                  Archiviert
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border divide-y">
            {filteredPayslips?.map((payslip) => (
              <div key={payslip.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {getMonthName(payslip.month)} {payslip.year}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatCurrency(payslip.gross_salary)} brutto</span>
                      <span>•</span>
                      <span>{formatCurrency(payslip.net_salary)} netto</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getStatusBadge(payslip.status)}
                  {payslip.document_path && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadPayslip(payslip.document_path)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {(!filteredPayslips || filteredPayslips.length === 0) && (
              <div className="p-4 text-center text-muted-foreground">
                Keine Gehaltsabrechnungen gefunden
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
