import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";

export const useCertificatesData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["employee-certificates", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("employee_certificates")
        .select("*")
        .eq("employee_id", employeeId)
        .order("issue_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Berechne Statistiken
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  const statistics = {
    total: certificates.length,
    active: certificates.filter(c => !c.expiry_date || new Date(c.expiry_date) > now).length,
    expiringSoon: certificates.filter(c => {
      if (!c.expiry_date) return false;
      const expiryDate = new Date(c.expiry_date);
      return expiryDate > now && expiryDate <= threeMonthsFromNow;
    }).length,
    expired: certificates.filter(c => c.expiry_date && new Date(c.expiry_date) < now).length,
  };

  // Gruppiere nach Kategorie
  const byCategory = certificates.reduce((acc, cert) => {
    const category = cert.category || "Sonstiges";
    if (!acc[category]) acc[category] = [];
    acc[category].push(cert);
    return acc;
  }, {} as Record<string, typeof certificates>);

  const uploadCertificate = useMutation({
    mutationFn: async (data: any) => {
      if (!companyId) throw new Error("Company ID fehlt");
      const { error } = await supabase
        .from("employee_certificates")
        .insert({ ...data, employee_id: employeeId, company_id: companyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat hinzugefügt" });
    },
    onError: (error: any) => {
      console.error('Certificate error:', error);
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    },
  });

  const updateCertificate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("employee_certificates")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat aktualisiert" });
    },
  });

  const deleteCertificate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_certificates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-certificates"] });
      toast({ title: "Zertifikat gelöscht" });
    },
  });

  return {
    certificates,
    statistics,
    byCategory,
    isLoading,
    uploadCertificate,
    updateCertificate,
    deleteCertificate,
  };
};
