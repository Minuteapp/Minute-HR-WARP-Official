
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ComplianceCase, 
  CompliancePolicy, 
  ComplianceAudit, 
  ComplianceIncident,
  WhistleblowerReport,
  ComplianceRisk,
  ComplianceDeadline,
  ComplianceReport,
  ComplianceMetric
} from '@/types/compliance';

// Compliance Cases
export const useComplianceCases = () => {
  return useQuery({
    queryKey: ['compliance-cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ComplianceCase[];
    },
  });
};

export const useCreateComplianceCase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (caseData: Omit<ComplianceCase, 'id' | 'case_number' | 'created_at' | 'updated_at'>) => {
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }

      const { data, error } = await supabase
        .from('compliance_cases')
        .insert({ ...caseData, company_id: companyId })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-cases'] });
      toast({
        title: "Fall erstellt",
        description: "Der Compliance-Fall wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Fall konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Compliance Policies
export const useCompliancePolicies = () => {
  return useQuery({
    queryKey: ['compliance-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_policies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompliancePolicy[];
    },
  });
};

export const useCreateCompliancePolicy = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (policy: Omit<CompliancePolicy, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }
      
      const { data, error } = await supabase
        .from('compliance_policies')
        .insert({
          ...policy,
          company_id: companyId,
          created_by: user?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as CompliancePolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-policies'] });
      toast({
        title: "Richtlinie erstellt",
        description: "Die Richtlinie wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Richtlinie konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Compliance Audits
export const useComplianceAudits = () => {
  return useQuery({
    queryKey: ['compliance-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ComplianceAudit[];
    },
  });
};

export const useCreateComplianceAudit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (audit: Omit<ComplianceAudit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }
      
      const { data, error } = await supabase
        .from('compliance_audits')
        .insert({
          ...audit,
          company_id: companyId,
          created_by: user?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceAudit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
      toast({
        title: "Audit erstellt",
        description: "Das Audit wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Audit konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

// Compliance Incidents
export const useComplianceIncidents = () => {
  return useQuery({
    queryKey: ['compliance-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) throw error;
      return data as ComplianceIncident[];
    },
  });
};

export const useCreateComplianceIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (incident: Omit<ComplianceIncident, 'id' | 'incident_number' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Bitte wählen Sie eine Firma aus oder wechseln Sie in den Tenant-Modus.');
      }
      
      const { data, error } = await supabase
        .from('compliance_incidents')
        .insert({
          ...incident,
          company_id: companyId,
          reported_by: incident.is_anonymous ? null : user?.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceIncident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-incidents'] });
      toast({
        title: "Vorfall gemeldet",
        description: "Der Vorfall wurde erfolgreich gemeldet.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Vorfall konnte nicht gemeldet werden.",
        variant: "destructive",
      });
    },
  });
};

// Whistleblower Reports
export const useWhistleblowerReports = () => {
  return useQuery({
    queryKey: ['whistleblower-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whistleblower_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WhistleblowerReport[];
    },
  });
};

// Compliance Risks
export const useComplianceRisks = () => {
  return useQuery({
    queryKey: ['compliance-risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_risks')
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;
      return data as ComplianceRisk[];
    },
  });
};

// Compliance Deadlines
export const useComplianceDeadlines = () => {
  return useQuery({
    queryKey: ['compliance-deadlines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_deadlines')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as ComplianceDeadline[];
    },
  });
};

// Compliance Stats
export const useComplianceStats = () => {
  return useQuery({
    queryKey: ['compliance-stats'],
    queryFn: async () => {
      // Get various compliance statistics
      const [casesResult, auditsResult, incidentsResult, risksResult] = await Promise.all([
        supabase.from('compliance_cases').select('status, priority'),
        supabase.from('compliance_audits').select('status, overall_rating'),
        supabase.from('compliance_incidents').select('investigation_status, severity'),
        supabase.from('compliance_risks').select('status, risk_score')
      ]);

      const cases = casesResult.data || [];
      const audits = auditsResult.data || [];
      const incidents = incidentsResult.data || [];
      const risks = risksResult.data || [];

      return {
        totalCases: cases.length,
        openCases: cases.filter(c => c.status === 'open').length,
        criticalCases: cases.filter(c => c.priority === 'critical').length,
        
        totalAudits: audits.length,
        activeAudits: audits.filter(a => a.status === 'in_progress').length,
        
        totalIncidents: incidents.length,
        openIncidents: incidents.filter(i => i.investigation_status === 'investigating').length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
        
        totalRisks: risks.length,
        highRisks: risks.filter(r => r.risk_score >= 20).length,
      };
    },
  });
};
