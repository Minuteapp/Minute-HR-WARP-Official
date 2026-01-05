
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { BillingRecord } from "./types";

// Keine Mock-Daten mehr - echte Daten aus der Datenbank

export const useBillingData = () => {
  const { toast } = useToast();
  
  const { data: billingRecords, isLoading } = useQuery({
    queryKey: ['admin-billing'],
    queryFn: async () => {
      try {
        // Echte Rechnungsdaten von der API laden
        // TODO: Implementierung einer billing_records Tabelle erforderlich
        // const { data, error } = await supabase.from('billing_records').select('*');
        // if (error) throw error;
        // return data || [];
        
        // Bis zur Implementierung werden leere Daten zurückgegeben
        return [];
      } catch (error: any) {
        toast({
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    }
  });

  // Calculate statistics from the billing records
  const totalRevenue = billingRecords?.reduce((sum, record) => sum + record.amount, 0) || 0;
  
  const pendingInvoices = billingRecords?.filter(record => 
    record.status === 'pending' || record.status === 'overdue'
  ).length || 0;
  
  const pendingAmount = billingRecords?.filter(record => 
    record.status === 'pending' || record.status === 'overdue'
  ).reduce((sum, record) => sum + record.amount, 0) || 0;
  
  const paidInvoices = billingRecords?.filter(record => 
    record.status === 'paid'
  ).length || 0;
  
  const paidAmount = billingRecords?.filter(record => 
    record.status === 'paid'
  ).reduce((sum, record) => sum + record.amount, 0) || 0;

  return {
    billingRecords,
    isLoading,
    totalRevenue,
    pendingInvoices,
    pendingAmount,
    paidInvoices,
    paidAmount
  };
};
