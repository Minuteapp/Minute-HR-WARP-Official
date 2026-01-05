import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  company_id: string | null;
  company_name?: string;
  module: string | null;
  created_by: string | null;
  assigned_to: string | null;
  assignee_name?: string;
  resolved_at: string | null;
  closed_at: string | null;
  sla_deadline: string | null;
  first_response_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateTicketData {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  company_id?: string;
  module?: string;
}

export const useSupportTickets = (filters?: { priority?: string; status?: string }) => {
  return useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          companies(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority.toLowerCase());
      }

      if (filters?.status && filters.status !== 'all') {
        const statusMap: Record<string, string> = {
          'Neu': 'new',
          'In Bearbeitung': 'in_progress',
          'Wartet': 'waiting',
          'Gelöst': 'resolved',
          'Geschlossen': 'closed'
        };
        query = query.eq('status', statusMap[filters.status] || filters.status.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(ticket => ({
        ...ticket,
        company_name: (ticket.companies as any)?.name || '-'
      })) as SupportTicket[];
    }
  });
};

export const useSupportTicketStats = () => {
  return useQuery({
    queryKey: ['support-ticket-stats'],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('status, priority, created_at, first_response_at, resolved_at');

      if (error) throw error;

      const openTickets = tickets?.filter(t => !['resolved', 'closed'].includes(t.status)) || [];
      const criticalTickets = openTickets.filter(t => t.priority === 'critical');
      
      // Berechne durchschnittliche Antwortzeit
      const ticketsWithResponse = tickets?.filter(t => t.first_response_at) || [];
      let avgResponseTime = 0;
      if (ticketsWithResponse.length > 0) {
        const responseTimes = ticketsWithResponse.map(t => {
          const created = new Date(t.created_at).getTime();
          const responded = new Date(t.first_response_at!).getTime();
          return (responded - created) / (1000 * 60 * 60); // Stunden
        });
        avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      // Berechne durchschnittliche Lösungszeit
      const resolvedTickets = tickets?.filter(t => t.resolved_at) || [];
      let avgResolutionTime = 0;
      if (resolvedTickets.length > 0) {
        const resolutionTimes = resolvedTickets.map(t => {
          const created = new Date(t.created_at).getTime();
          const resolved = new Date(t.resolved_at!).getTime();
          return (resolved - created) / (1000 * 60 * 60); // Stunden
        });
        avgResolutionTime = resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length;
      }

      return {
        openTickets: openTickets.length,
        criticalTickets: criticalTickets.length,
        avgResponseTime: avgResponseTime.toFixed(1),
        avgResolutionTime: avgResolutionTime.toFixed(1),
        totalTickets: tickets?.length || 0
      };
    }
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          ...data,
          ticket_number: '', // Wird durch Trigger generiert
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket-stats'] });
      toast({
        title: 'Ticket erstellt',
        description: 'Das Support-Ticket wurde erfolgreich erstellt.'
      });
    },
    onError: () => {
      toast({
        title: 'Fehler',
        description: 'Das Ticket konnte nicht erstellt werden.',
        variant: 'destructive'
      });
    }
  });
};
