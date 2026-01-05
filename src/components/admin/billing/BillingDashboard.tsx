
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingStats } from "./BillingStats";
import { InvoicesTable } from "./InvoicesTable";
import { useBillingData } from "./useBillingData";
import { useToast } from "@/hooks/use-toast";

export const BillingDashboard = () => {
  const { toast } = useToast();
  
  const {
    billingRecords,
    isLoading,
    totalRevenue,
    pendingInvoices,
    pendingAmount,
    paidInvoices,
    paidAmount
  } = useBillingData();

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download gestartet",
      description: "Die Rechnung wird heruntergeladen.",
    });
    // Implement actual download logic here
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Abrechnungsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingStats 
            totalRevenue={totalRevenue}
            pendingInvoices={pendingInvoices}
            pendingAmount={pendingAmount}
            paidInvoices={paidInvoices}
            paidAmount={paidAmount}
          />
          
          <InvoicesTable 
            invoices={billingRecords}
            isLoading={isLoading}
            onDownload={handleDownloadInvoice}
          />
        </CardContent>
      </Card>
    </div>
  );
};
