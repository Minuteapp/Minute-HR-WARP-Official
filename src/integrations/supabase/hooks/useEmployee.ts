import { useQuery } from "@tanstack/react-query";
import { supabase } from "../client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export const useEmployee = (employeeId: string | undefined) => {
  const { tenantCompany, isSuperAdmin, refetchTenant } = useTenant();
  const { toast } = useToast();
  const [autoTenantSet, setAutoTenantSet] = useState(false);
  
  // Automatische Tenant-Erkennung für SuperAdmins
  useEffect(() => {
    const autoSetTenant = async () => {
      if (!employeeId || !isSuperAdmin || tenantCompany || autoTenantSet) {
        return;
      }
      
      console.log('🔄 SuperAdmin ohne Tenant-Modus - versuche automatische Erkennung...');
      
      try {
        // Hole erst die company_id des Mitarbeiters (ohne RLS-Einschränkung)
        const { data: employeeBasic, error: empError } = await supabase
          .from('employees')
          .select('id, company_id')
          .eq('id', employeeId)
          .maybeSingle();
        
        if (empError || !employeeBasic?.company_id) {
          console.warn('⚠️ Konnte Mitarbeiter-Company nicht ermitteln:', empError);
          return;
        }
        
        console.log('📍 Mitarbeiter gehört zu Company:', employeeBasic.company_id);
        
        // Hole Firmendaten
        const { data: company, error: compError } = await supabase
          .from('companies')
          .select('id, name, slug')
          .eq('id', employeeBasic.company_id)
          .single();
        
        if (compError || !company) {
          console.warn('⚠️ Konnte Firma nicht laden:', compError);
          return;
        }
        
        // Hole aktuellen User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('⚠️ Kein User für Tenant-Session');
          return;
        }
        
        // Setze Tenant-Session in der Datenbank
        const { error: sessionError } = await supabase
          .from('user_tenant_sessions')
          .upsert({
            user_id: user.id,
            tenant_company_id: company.id,
            is_tenant_mode: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (sessionError) {
          console.error('❌ Fehler beim Setzen der Tenant-Session:', sessionError);
          return;
        }
        
        console.log('✅ Automatischer Tenant-Modus aktiviert für:', company.name);
        setAutoTenantSet(true);
        
        // Toast anzeigen
        toast({
          title: "Automatischer Tenant-Modus",
          description: `Sie arbeiten jetzt im Kontext von: ${company.name}`,
        });
        
        // TenantContext neu laden
        refetchTenant();
        
      } catch (error) {
        console.error('💥 Fehler bei automatischer Tenant-Erkennung:', error);
      }
    };
    
    autoSetTenant();
  }, [employeeId, isSuperAdmin, tenantCompany, autoTenantSet, refetchTenant, toast]);
  
  return useQuery({
    queryKey: ["employee", employeeId, tenantCompany?.id, autoTenantSet],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      // Wenn SuperAdmin noch keinen Tenant hat, warte auf Auto-Tenant
      if (isSuperAdmin && !tenantCompany && !autoTenantSet) {
        console.log('⏳ Warte auf automatischen Tenant-Modus...');
        // Kurze Verzögerung, um Auto-Tenant-Logik Zeit zu geben
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          user_roles(role, company_id)
        `)
        .eq("id", employeeId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
    retry: 2,
    retryDelay: 500,
  });
};

export const useEmployeeAbsences = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-absences", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      const { data, error } = await supabase
        .from("absence_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useEmployeeDocuments = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-documents", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
};

export const useEmployeeQuotas = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-quotas", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      
      const { data, error } = await supabase
        .from("absence_quotas")
        .select("*")
        .eq("user_id", userId)
        .eq("quota_year", new Date().getFullYear());
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
