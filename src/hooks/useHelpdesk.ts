
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { HelpdeskTicket, HelpdeskComment, HelpdeskSLAConfig, HelpdeskKnowledgeBase } from '@/types/helpdesk';

export const useHelpdeskTickets = () => {
  return useQuery({
    queryKey: ['helpdesk-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HelpdeskTicket[];
    },
  });
};

export const useHelpdeskTicket = (id: string) => {
  return useQuery({
    queryKey: ['helpdesk-ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select(`
          *,
          comments:helpdesk_comments(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateHelpdeskTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ticket: Omit<HelpdeskTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // company_id über RPC ermitteln (unterstützt Tenant-Modus)
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Keine Firma zugeordnet. Bitte prüfen Sie Ihre Firmenzuordnung.');
      }
      
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .insert({
          ...ticket,
          company_id: companyId,
          created_by: user?.user?.id || ticket.created_by
        })
        .select()
        .single();

      if (error) throw error;
      return data as HelpdeskTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-helpdesk-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-stats'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-kpis'] });
      toast({
        title: "Ticket erstellt",
        description: "Das Helpdesk-Ticket wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Ticket konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHelpdeskTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...ticket }: Partial<HelpdeskTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .update(ticket)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as HelpdeskTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] });
      toast({
        title: "Ticket aktualisiert",
        description: "Das Helpdesk-Ticket wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Das Ticket konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

export const useHelpdeskComments = (ticketId: string) => {
  return useQuery({
    queryKey: ['helpdesk-comments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as HelpdeskComment[];
    },
    enabled: !!ticketId,
  });
};

export const useCreateHelpdeskComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (comment: Omit<HelpdeskComment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('helpdesk_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data as HelpdeskComment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-comments', data.ticket_id] });
      toast({
        title: "Kommentar hinzugefügt",
        description: "Der Kommentar wurde erfolgreich hinzugefügt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Kommentar konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useSLAConfigs = () => {
  return useQuery({
    queryKey: ['helpdesk-sla-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_sla_configs')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as HelpdeskSLAConfig[];
    },
  });
};

export const useKnowledgeBase = () => {
  return useQuery({
    queryKey: ['helpdesk-knowledge-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_knowledge_base')
        .select('*')
        .eq('is_public', true)
        .order('view_count', { ascending: false });

      if (error) throw error;
      return data as HelpdeskKnowledgeBase[];
    },
  });
};

export const useHelpdeskStats = () => {
  return useQuery({
    queryKey: ['helpdesk-stats'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('helpdesk_tickets')
        .select('status, priority, created_at');

      if (error) throw error;

      const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        high: tickets.filter(t => t.priority === 'high').length,
      };

      return stats;
    },
  });
};

// Paginierte Tickets mit Filter für Enterprise-Ansicht
export const useHelpdeskTicketsPaginated = (options: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: ['helpdesk-tickets-paginated', options],
    queryFn: async () => {
      let query = supabase
        .from('helpdesk_tickets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (options.search) {
        query = query.or(`ticket_number.ilike.%${options.search}%,title.ilike.%${options.search}%,requester_name.ilike.%${options.search}%`);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options.category) {
        query = query.eq('category', options.category);
      }

      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { 
        tickets: data as HelpdeskTicket[], 
        totalCount: count || 0 
      };
    },
  });
};

// Meine Tickets (nur eigene)
export const useMyHelpdeskTickets = () => {
  return useQuery({
    queryKey: ['my-helpdesk-tickets'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select('*')
        .eq('created_by', user?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HelpdeskTicket[];
    },
  });
};

// KPI Stats für Enterprise Dashboard
export const useHelpdeskKPIs = () => {
  return useQuery({
    queryKey: ['helpdesk-kpis'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('helpdesk_tickets')
        .select('status, sla_due_date');

      if (error) throw error;

      const now = new Date();
      const slaCritical = tickets.filter(t => {
        if (!t.sla_due_date) return false;
        const slaDate = new Date(t.sla_due_date);
        const hoursRemaining = (slaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursRemaining < 6 || hoursRemaining < 0;
      }).length;

      const kpis = {
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        slaCritical,
        total: tickets.length,
      };

      return kpis;
    },
  });
};

// ===== NEUE HOOKS FÜR PHASE 1-5 =====

// Erweiterte Statistiken mit Kategorie-Verteilung
export const useHelpdeskCategoryStats = () => {
  return useQuery({
    queryKey: ['helpdesk-category-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: tickets, error } = await supabase
        .from('helpdesk_tickets')
        .select('category, status, created_at, resolved_at, first_response_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Kategorie-Statistiken berechnen
      const categoryMap: Record<string, number> = {};
      tickets.forEach(t => {
        const cat = t.category || 'Sonstige';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const total = tickets.length || 1;
      const categoryStats = Object.entries(categoryMap)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Durchschnittliche Reaktions- und Lösungszeit berechnen
      const ticketsWithResponse = tickets.filter(t => t.first_response_at && t.created_at);
      const avgResponseTimeHours = ticketsWithResponse.length > 0
        ? ticketsWithResponse.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const responded = new Date(t.first_response_at!).getTime();
            return sum + (responded - created) / (1000 * 60 * 60);
          }, 0) / ticketsWithResponse.length
        : 0;

      const ticketsResolved = tickets.filter(t => t.resolved_at && t.created_at);
      const avgResolutionTimeHours = ticketsResolved.length > 0
        ? ticketsResolved.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const resolved = new Date(t.resolved_at!).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60);
          }, 0) / ticketsResolved.length
        : 0;

      const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
      const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100 * 10) / 10 : 0;

      return {
        categoryStats,
        avgResponseTimeHours: Math.round(avgResponseTimeHours * 10) / 10,
        avgResolutionTimeHours: Math.round(avgResolutionTimeHours * 10) / 10,
        resolutionRate,
        totalTickets: tickets.length,
      };
    },
  });
};

// Audit-Log für letzte Aktivitäten
export const useHelpdeskAuditLog = (limit = 10) => {
  return useQuery({
    queryKey: ['helpdesk-audit-log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_audit_log')
        .select(`
          *,
          ticket:helpdesk_tickets(ticket_number, title)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};

// Top Agenten aus Tickets berechnen
export const useHelpdeskTopAgents = () => {
  return useQuery({
    queryKey: ['helpdesk-top-agents'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('helpdesk_tickets')
        .select('assigned_to, status, resolved_at, created_at, first_response_at')
        .not('assigned_to', 'is', null);

      if (error) throw error;

      // Agenten aggregieren
      const agentMap: Record<string, {
        resolved: number;
        totalTimeHours: number;
        count: number;
      }> = {};

      tickets.forEach(t => {
        if (!t.assigned_to) return;
        if (!agentMap[t.assigned_to]) {
          agentMap[t.assigned_to] = { resolved: 0, totalTimeHours: 0, count: 0 };
        }
        if (t.status === 'resolved' || t.status === 'closed') {
          agentMap[t.assigned_to].resolved++;
          if (t.resolved_at && t.created_at) {
            const hours = (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
            agentMap[t.assigned_to].totalTimeHours += hours;
            agentMap[t.assigned_to].count++;
          }
        }
      });

      // Profil-Daten laden
      const agentIds = Object.keys(agentMap);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', agentIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

      const topAgents = Object.entries(agentMap)
        .map(([id, data]) => ({
          id,
          name: profileMap.get(id) || 'Unbekannt',
          resolved: data.resolved,
          avgTime: data.count > 0 ? `${Math.round(data.totalTimeHours / data.count * 10) / 10}h` : '-',
          satisfaction: 4.5 + Math.random() * 0.5, // Placeholder bis Surveys implementiert
        }))
        .sort((a, b) => b.resolved - a.resolved)
        .slice(0, 4)
        .map((agent, index) => ({ ...agent, rank: index + 1 }));

      return topAgents;
    },
  });
};

// Workflows aus DB
export const useHelpdeskWorkflows = () => {
  return useQuery({
    queryKey: ['helpdesk-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateHelpdeskWorkflow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workflow: {
      name: string;
      trigger_type: string;
      trigger_conditions: Record<string, unknown>;
      actions: Record<string, unknown>[];
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('helpdesk_workflows')
        .insert(workflow)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-workflows'] });
      toast({
        title: "Workflow erstellt",
        description: "Der Workflow wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Workflow konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateHelpdeskWorkflow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...workflow }: { id: string; is_active?: boolean; name?: string }) => {
      const { data, error } = await supabase
        .from('helpdesk_workflows')
        .update(workflow)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-workflows'] });
      toast({
        title: "Workflow aktualisiert",
        description: "Der Workflow wurde erfolgreich aktualisiert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Workflow konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });
};

// Teams aus DB
export const useHelpdeskTeams = () => {
  return useQuery({
    queryKey: ['helpdesk-teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_teams')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

// Helpdesk-Einstellungen speichern/laden
export const useHelpdeskSettings = () => {
  return useQuery({
    queryKey: ['helpdesk-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('category', 'helpdesk')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.settings || null;
    },
  });
};

export const useSaveHelpdeskSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const { data: existing } = await supabase
        .from('global_settings')
        .select('id')
        .eq('category', 'helpdesk')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('global_settings')
          .update({ settings, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('global_settings')
          .insert({ category: 'helpdesk', settings });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-settings'] });
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Helpdesk-Einstellungen wurden erfolgreich gespeichert.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    },
  });
};

// User Vacation Data für Self-Service
export const useUserVacationData = () => {
  return useQuery({
    queryKey: ['user-vacation-data'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return null;

      const currentYear = new Date().getFullYear();

      const { data: quota, error } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('quota_year', currentYear)
        .eq('absence_type', 'vacation')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return quota ? {
        total: quota.total_days || 30,
        used: quota.used_days || 0,
        remaining: quota.remaining_days || quota.total_days || 30,
      } : {
        total: 30,
        used: 0,
        remaining: 30,
      };
    },
  });
};

// User Profile für Self-Service
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      const { data: employee } = await supabase
        .from('employees')
        .select('*, teams(name)')
        .eq('user_id', user.user.id)
        .single();

      return {
        displayName: profile?.display_name || user.user.email?.split('@')[0] || 'Benutzer',
        role: employee?.position || 'Mitarbeiter',
        team: employee?.teams?.name || '-',
        location: employee?.work_location || '-',
      };
    },
  });
};
