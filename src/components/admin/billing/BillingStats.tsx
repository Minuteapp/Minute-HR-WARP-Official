
import { Receipt, Clock, CheckCircle } from "lucide-react";

interface BillingStatsProps {
  totalRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  paidInvoices: number;
  paidAmount: number;
}

export const BillingStats = ({ 
  totalRevenue, 
  pendingInvoices, 
  pendingAmount, 
  paidInvoices, 
  paidAmount 
}: BillingStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="border rounded-lg p-4 border-primary/30">
        <div className="flex justify-between items-start mb-2">
          <span className="text-muted-foreground text-sm">Gesamtumsatz</span>
          <Receipt className="h-5 w-5 text-blue-500" />
        </div>
        <div className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground mt-1">Keine Daten verfügbar</div>
      </div>
      
      <div className="border rounded-lg p-4 border-primary/30">
        <div className="flex justify-between items-start mb-2">
          <span className="text-muted-foreground text-sm">Offene Rechnungen</span>
          <Clock className="h-5 w-5 text-orange-500" />
        </div>
        <div className="text-3xl font-bold">{pendingInvoices}</div>
        <div className="text-sm text-muted-foreground mt-1">€{pendingAmount.toFixed(2)} ausstehend</div>
      </div>
      
      <div className="border rounded-lg p-4 border-primary/30">
        <div className="flex justify-between items-start mb-2">
          <span className="text-muted-foreground text-sm">Bezahlte Rechnungen</span>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="text-3xl font-bold">{paidInvoices}</div>
        <div className="text-sm text-muted-foreground mt-1">€{paidAmount.toFixed(2)} eingegangen</div>
      </div>
    </div>
  );
};
