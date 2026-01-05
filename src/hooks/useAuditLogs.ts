import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  action: string;
  user_email: string | null;
  ip_address: string | null;
  created_at: string;
  old_values: any;
  new_values: any;
  company_id?: string;
}

interface UseAuditLogsOptions {
  companyId?: string;
  limit?: number;
  type?: string;
}

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { companyId, limit = 100, type } = options;

  return useQuery({
    queryKey: ['audit-logs', companyId, limit, type],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      if (type && type !== 'all') {
        query = query.eq('action', type.toUpperCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuditLog[];
    }
  });
};

export const useAuditLogsStats = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return useQuery({
    queryKey: ['audit-logs-stats'],
    queryFn: async () => {
      // Logs in den letzten 24 Stunden
      const { count: logsCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      // Admin-Aktionen
      const { count: adminActions } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())
        .in('action', ['UPDATE', 'DELETE', 'INSERT']);

      // Login-Events aus user_login_history
      const { count: loginEvents } = await supabase
        .from('user_login_history')
        .select('*', { count: 'exact', head: true })
        .gte('login_at', yesterday.toISOString());

      return {
        logsLast24h: logsCount || 0,
        adminActions: adminActions || 0,
        loginEvents: loginEvents || 0,
        systemEvents: (logsCount || 0) - (adminActions || 0)
      };
    }
  });
};
