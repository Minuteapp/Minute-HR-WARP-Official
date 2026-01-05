import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";

export type CertificateStatus = 'valid' | 'expiring_soon' | 'expired';

export interface CertificateWithStatus {
  id: string;
  employee_id: string;
  name: string;
  provider: string;
  issued_date: string;
  expiry_date: string | null;
  category: string | null;
  certificate_number: string | null;
  score: string | null;
  file_url: string | null;
  status: CertificateStatus;
  daysUntilExpiry: number | null;
  created_at: string;
}

export const useEmployeeCertificates = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-certificates", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_certificates")
        .select("*")
        .eq("employee_id", employeeId)
        .order("expiry_date", { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      
      // Calculate status for each certificate
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return data.map(cert => {
        const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
        const daysUntilExpiry = expiryDate 
          ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : null;
        
        let status: CertificateStatus = 'valid';
        if (expiryDate) {
          if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
            status = 'expired';
          } else if (daysUntilExpiry !== null && daysUntilExpiry <= 180) {
            status = 'expiring_soon';
          }
        }
        
        return { 
          ...cert, 
          status, 
          daysUntilExpiry 
        } as CertificateWithStatus;
      });
    },
    enabled: !!employeeId,
  });
};
