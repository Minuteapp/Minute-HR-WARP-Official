import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantDetails {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  tariff: string;
  contractStart: string | null;
  duration: string;
  region: string;
  employees: number;
  admins: number;
  activeModules: number;
  country: string;
}

export const useTenantDetails = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['tenant-details', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      // Hole Firma
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (companyError) throw companyError;

      // Hole Mitarbeiterzahl
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .eq('status', 'active');

      // Hole Admin-Anzahl
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .in('role', ['admin', 'superadmin']);

      // Hole aktive Module (Spalte heißt is_enabled, nicht is_active)
      const { count: moduleCount } = await supabase
        .from('company_module_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .eq('is_enabled', true);

      return {
        id: company.id,
        name: company.name,
        email: company.email || null,
        phone: company.phone || null,
        address: company.address || null,
        status: company.is_active ? 'active' : 'suspended',
        tariff: company.subscription_status === 'enterprise' ? 'Enterprise' : 
                company.subscription_status === 'pro' ? 'Pro' : 'Basic',
        contractStart: company.created_at?.split('T')[0] || null,
        duration: '12 Monate', // Könnte aus einem separaten Feld kommen
        region: company.region || 'EU-DE',
        country: company.country || 'Deutschland',
        employees: employeeCount || 0,
        admins: adminCount || 0,
        activeModules: moduleCount || 0
      } as TenantDetails;
    },
    enabled: !!tenantId
  });
};

export const useTenantUsers = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['tenant-users', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      // 1. Hole ALLE Mitarbeiter aus employees-Tabelle (mit und ohne Auth-Account)
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, user_id, first_name, last_name, email, position, status, created_at')
        .eq('company_id', tenantId)
        .or('archived.is.null,archived.eq.false');

      if (empError) {
        console.error('Error fetching employees:', empError);
      }

      // 2. Hole Admins aus admin_invitations-Tabelle (alle Status: created, accepted, pending)
      const { data: admins, error: adminError } = await supabase
        .from('admin_invitations')
        .select('id, full_name, email, status, created_at')
        .eq('company_id', tenantId)
        .in('status', ['created', 'accepted', 'pending']);

      if (adminError) {
        console.error('Error fetching admins:', adminError);
      }

      // 3. Hole User Roles für diese Firma (um alle Auth-User zu erfassen)
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('company_id', tenantId);

      if (rolesError) {
        console.error('Error fetching user_roles:', rolesError);
      }

      // Map für Deduplizierung basierend auf user_id
      const userMap = new Map<string, {
        id: string;
        employee_id?: string;
        admin_invitation_id?: string;
        name: string;
        email: string;
        role: string;
        status: string;
        twoFa: boolean;
        lastLogin: string;
        hasAuthAccount: boolean;
      }>();

      // 4. User Roles verarbeiten und Rollen-Mapping erstellen
      const userRoleMap = new Map<string, string>();
      for (const ur of (userRoles || [])) {
        const existingRole = userRoleMap.get(ur.user_id);
        // Höchste Rolle behalten (superadmin > admin > hr_admin > team_lead > employee)
        const rolePriority: Record<string, number> = { 
          superadmin: 5, admin: 4, hr_admin: 3, team_lead: 2, employee: 1 
        };
        if (!existingRole || (rolePriority[ur.role] || 0) > (rolePriority[existingRole] || 0)) {
          userRoleMap.set(ur.user_id, ur.role);
        }
      }

      // 5. Rolle als lesbaren Text
      const getRoleLabel = (role: string): string => {
        const roleLabels: Record<string, string> = {
          superadmin: 'Super-Admin',
          admin: 'Admin',
          hr_admin: 'HR-Admin',
          team_lead: 'Teamleiter',
          employee: 'Mitarbeiter'
        };
        return roleLabels[role] || 'Mitarbeiter';
      };

      // 6. Employees verarbeiten
      for (const emp of (employees || [])) {
        const uniqueId = emp.user_id || emp.id;
        const dbRole = emp.user_id ? userRoleMap.get(emp.user_id) : undefined;
        
        userMap.set(uniqueId, {
          id: uniqueId,
          employee_id: emp.id,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
          email: emp.email || '-',
          role: getRoleLabel(dbRole || 'employee'),
          status: emp.status === 'active' ? 'Aktiv' : 'Inaktiv',
          twoFa: false,
          lastLogin: '-',
          hasAuthAccount: !!emp.user_id
        });
      }

      // 7. Admin Invitations verarbeiten
      for (const admin of (admins || [])) {
        if (!admin.email) continue;
        
        // Auth-User-ID über E-Mail finden
        const { data: authUserId } = await supabase.rpc('get_user_id_by_email', {
          p_email: admin.email
        });
        
        const uniqueId = authUserId || admin.id;
        
        // Nur hinzufügen wenn noch nicht vorhanden (Employee hat Vorrang)
        if (!userMap.has(uniqueId)) {
          const statusLabel = admin.status === 'accepted' ? 'Aktiv' : 
                              admin.status === 'pending' ? 'Ausstehend' : 'Erstellt';
          userMap.set(uniqueId, {
            id: uniqueId,
            admin_invitation_id: admin.id,
            name: admin.full_name || 'Unbekannt',
            email: admin.email || '-',
            role: 'Admin',
            status: statusLabel,
            twoFa: false,
            lastLogin: '-',
            hasAuthAccount: !!authUserId
          });
        }
      }

      // Ergebnis: Sortiert nach Rolle (Admins zuerst)
      const result = Array.from(userMap.values());
      result.sort((a, b) => {
        const rolePriority: Record<string, number> = { 
          'Super-Admin': 5, 'Admin': 4, 'HR-Admin': 3, 'Teamleiter': 2, 'Mitarbeiter': 1 
        };
        return (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0);
      });

      return result;
    },
    enabled: !!tenantId
  });
};

export const useTenantModules = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['tenant-modules', tenantId],
    queryFn: async () => {
      if (!tenantId) return { activeModules: [], limits: [] };

      // 1. Hole aktive Module (Spalte heißt is_enabled, nicht is_active)
      const { data: modules, error: moduleError } = await supabase
        .from('company_module_assignments')
        .select('*')
        .eq('company_id', tenantId)
        .eq('is_enabled', true);

      if (moduleError) throw moduleError;

      const moduleNames = (modules || []).map(m => m.module_key);

      // 2. Hole echte Nutzungsdaten
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId)
        .or('archived.is.null,archived.eq.false');

      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', tenantId);

      // 3. Hole Limits aus company_feature_limits wenn vorhanden
      const { data: featureLimits } = await supabase
        .from('company_feature_limits')
        .select('*')
        .eq('company_id', tenantId);

      // Standard-Limits mit echten Nutzungsdaten
      const limits = [
        { 
          name: 'Mitarbeiter', 
          used: employeeCount || 0, 
          max: featureLimits?.find(l => l.feature_key === 'employees')?.limit_value || 100 
        },
        { 
          name: 'Projekte', 
          used: projectCount || 0, 
          max: featureLimits?.find(l => l.feature_key === 'projects')?.limit_value || 50 
        },
        { 
          name: 'Module', 
          used: moduleNames.length, 
          max: featureLimits?.find(l => l.feature_key === 'modules')?.limit_value || 20 
        }
      ];

      return { activeModules: moduleNames, limits };
    },
    enabled: !!tenantId
  });
};

export const useTenantAuditLogs = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ['tenant-audit-logs', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(log => ({
        timestamp: new Date(log.created_at).toLocaleString('de-DE'),
        user: log.user_email || 'System',
        action: log.action,
        details: log.table_name || '-'
      }));
    },
    enabled: !!tenantId
  });
};
