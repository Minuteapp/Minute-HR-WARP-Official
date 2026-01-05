import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import { logAccess } from "@/lib/access-logger";

export interface HomeofficeAgreement {
  id: string;
  employee_id: string;
  model_type: '3_days_week' | '2_days_week' | '4_days_week' | 'full_remote' | 'hybrid';
  days_per_week: number;
  remote_percentage: number;
  office_percentage: number;
  preferred_home_days: string[];
  office_days: string[];
  core_hours_start: string;
  core_hours_end: string;
  valid_since: string;
  badge_color: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RemoteEquipment {
  id: string;
  employee_id: string;
  budget_amount: number;
  budget_currency: string;
  budget_type: 'one_time' | 'annual';
  budget_used: number;
  budget_remaining: number;
  budget_status: 'available' | 'partially_used' | 'fully_used';
  created_at: string;
  updated_at: string;
}

export interface RemoteEquipmentItem {
  id: string;
  employee_id: string;
  equipment_id: string;
  item_name: string;
  item_category: string;
  assigned_date: string;
  cost: number;
  status: 'assigned' | 'requested' | 'returned';
  serial_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeskBooking {
  id: string;
  employee_id: string;
  workspace_model: 'desk_sharing' | 'fixed_desk' | 'hot_desking';
  preferred_floor?: string;
  workspace_type?: string;
  locker_number?: string;
  locker_assigned: boolean;
  badge_label?: string;
  badge_color: string;
  created_at: string;
  updated_at: string;
}

export interface DeskBookingEntry {
  id: string;
  employee_id: string;
  desk_booking_id: string;
  booking_date: string;
  desk_number?: string;
  floor?: string;
  status: 'gebucht' | 'storniert' | 'abgelaufen';
  created_at: string;
  updated_at: string;
}

export interface WorkTimeModel {
  id: string;
  employee_id: string;
  model_name: string;
  hours_per_week: number;
  model_type: 'gleitzeit' | '4_day_week' | 'flexible' | 'fixed';
  badge_label?: string;
  badge_color: string;
  description?: string;
  core_hours_start?: string;
  core_hours_end?: string;
  flex_time_start?: string;
  flex_time_end?: string;
  overtime_balance_current: number;
  overtime_balance_max: number;
  is_active: boolean;
  available_models?: any[];
  created_at: string;
  updated_at: string;
}

export interface Workation {
  id: string;
  employee_id: string;
  country: string;
  city: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: 'genehmigt' | 'ausstehend' | 'abgelehnt' | 'abgeschlossen';
  badge_color?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkationSummary {
  id: string;
  employee_id: string;
  year: number;
  available_days_per_year: number;
  days_used: number;
  days_remaining: number;
  allowed_countries: string[];
  next_workation_country?: string;
  next_workation_month?: string;
  created_at: string;
  updated_at: string;
}

export interface RemoteWorkStats {
  id: string;
  employee_id: string;
  year: number;
  total_work_days: number;
  homeoffice_days: number;
  office_days: number;
  remote_quote_percentage: number;
  co2_savings_kg?: number;
  meeting_remote_percentage?: number;
  productivity_change_percentage?: number;
  homeoffice_distribution?: any;
  stats_period_start: string;
  stats_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectivitySupport {
  id: string;
  employee_id: string;
  internet_allowance_amount?: number;
  internet_allowance_currency: string;
  internet_allowance_frequency: string;
  mobile_data_plan?: string;
  mobile_data_type?: string;
  vpn_access: boolean;
  vpn_status?: string;
  collaboration_tools?: any[];
  it_support_hotline?: string;
  it_support_hours?: string;
  remote_support_available: boolean;
  ticket_system_available: boolean;
  avg_response_time?: string;
  created_at: string;
  updated_at: string;
}

export const useHomeofficeAgreement = (employeeId: string) => {
  return useQuery({
    queryKey: ['homeoffice-agreement', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_homeoffice_agreements')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) throw error;
      return data as HomeofficeAgreement;
    },
    enabled: !!employeeId,
  });
};

export const useRemoteEquipment = (employeeId: string) => {
  return useQuery({
    queryKey: ['remote-equipment', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_remote_equipment')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) throw error;
      return data as RemoteEquipment;
    },
    enabled: !!employeeId,
  });
};

export const useRemoteEquipmentItems = (employeeId: string) => {
  return useQuery({
    queryKey: ['remote-equipment-items', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_remote_equipment_items')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assigned_date', { ascending: false });
      
      if (error) throw error;
      return data as RemoteEquipmentItem[];
    },
    enabled: !!employeeId,
  });
};

export const useDeskBooking = (employeeId: string) => {
  return useQuery({
    queryKey: ['desk-booking', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_desk_bookings')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) throw error;
      return data as DeskBooking;
    },
    enabled: !!employeeId,
  });
};

export const useDeskBookingEntries = (employeeId: string) => {
  return useQuery({
    queryKey: ['desk-booking-entries', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_desk_booking_entries')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date', { ascending: true });
      
      if (error) throw error;
      return data as DeskBookingEntry[];
    },
    enabled: !!employeeId,
  });
};

export const useWorkTimeModel = (employeeId: string) => {
  return useQuery({
    queryKey: ['work-time-model', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_work_time_models')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as WorkTimeModel;
    },
    enabled: !!employeeId,
  });
};

export const useWorkations = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: ['workations', employeeId, year],
    queryFn: async () => {
      let query = supabase
        .from('employee_workations')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (year) {
        query = query
          .gte('start_date', `${year}-01-01`)
          .lte('start_date', `${year}-12-31`);
      }
      
      const { data, error } = await query.order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as Workation[];
    },
    enabled: !!employeeId,
  });
};

export const useWorkationSummary = (employeeId: string, year: number) => {
  return useQuery({
    queryKey: ['workation-summary', employeeId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_workation_summary')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .single();
      
      if (error) throw error;
      return data as WorkationSummary;
    },
    enabled: !!employeeId,
  });
};

export const useRemoteWorkStats = (employeeId: string, year: number) => {
  return useQuery({
    queryKey: ['remote-work-stats', employeeId, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_remote_work_stats')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .single();
      
      if (error) throw error;
      return data as RemoteWorkStats;
    },
    enabled: !!employeeId,
  });
};

export const useConnectivitySupport = (employeeId: string) => {
  return useQuery({
    queryKey: ['connectivity-support', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_connectivity_support')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) throw error;
      return data as ConnectivitySupport;
    },
    enabled: !!employeeId,
  });
};

export const useUpdateHomeofficeAgreement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<HomeofficeAgreement> & { employee_id: string }) => {
      const { data: result, error } = await supabase
        .from('employee_homeoffice_agreements')
        .update(data)
        .eq('employee_id', data.employee_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log access
      await logAccess({
        employeeId: data.employee_id,
        action: 'Homeoffice-Vereinbarung aktualisiert',
        module: 'Remote Work',
        category: 'edit',
        details: { changes: data },
      });
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homeoffice-agreement', variables.employee_id] });
      queryClient.invalidateQueries({ queryKey: ['access-logs', variables.employee_id] });
    },
  });
};

export const useRequestEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<RemoteEquipmentItem>) => {
      const { data: result, error } = await supabase
        .from('employee_remote_equipment_items')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log access
      if (data.employee_id) {
        await logAccess({
          employeeId: data.employee_id,
          action: `Ausstattung angefordert: ${data.item_name}`,
          module: 'Remote Work',
          category: 'create',
          details: { item: data },
        });
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['remote-equipment-items', variables.employee_id] });
      if (variables.employee_id) {
        queryClient.invalidateQueries({ queryKey: ['access-logs', variables.employee_id] });
      }
    },
  });
};

export const useCreateWorkationRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Workation>) => {
      const { data: result, error } = await supabase
        .from('employee_workations')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log access
      if (data.employee_id) {
        await logAccess({
          employeeId: data.employee_id,
          action: `Workation beantragt: ${data.city}, ${data.country}`,
          module: 'Remote Work',
          category: 'create',
          details: { workation: data },
        });
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workations', variables.employee_id] });
      queryClient.invalidateQueries({ queryKey: ['workation-summary', variables.employee_id] });
      if (variables.employee_id) {
        queryClient.invalidateQueries({ queryKey: ['access-logs', variables.employee_id] });
      }
    },
  });
};

// Helper Functions für Buchungs-Validierung
const getStartOfWeek = (date: string) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Montag
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

const getEndOfWeek = (date: string) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 5); // Freitag
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
};

export const useBookDesk = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<DeskBookingEntry>) => {
      // Validierung: Max. 3 Buchungen pro Woche
      const { data: existingBookings, error: fetchError } = await supabase
        .from('employee_desk_booking_entries')
        .select('*')
        .eq('employee_id', data.employee_id)
        .gte('booking_date', getStartOfWeek(data.booking_date!))
        .lte('booking_date', getEndOfWeek(data.booking_date!))
        .eq('status', 'gebucht');
      
      if (fetchError) throw fetchError;
      
      if (existingBookings && existingBookings.length >= 3) {
        throw new Error('Maximale Anzahl von 3 Buchungen pro Woche erreicht');
      }
      
      // Erstelle Buchung
      const { data: result, error } = await supabase
        .from('employee_desk_booking_entries')
        .insert({
          ...data,
          status: 'gebucht',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log access
      if (data.employee_id) {
        await logAccess({
          employeeId: data.employee_id,
          action: `Arbeitsplatz gebucht für ${data.booking_date}`,
          module: 'Office Workspace',
          category: 'create',
          details: { booking: data },
        });
      }
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['desk-booking-entries', variables.employee_id] });
      if (variables.employee_id) {
        queryClient.invalidateQueries({ queryKey: ['access-logs', variables.employee_id] });
      }
    },
  });
};

export const useUpsertHomeofficeAgreement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<HomeofficeAgreement> & { employee_id: string }) => {
      // Upsert: Insert if not exists, update if exists
      const { data: result, error } = await supabase
        .from('employee_homeoffice_agreements')
        .upsert(data, { onConflict: 'employee_id' })
        .select()
        .single();
      
      if (error) throw error;
      
      // Log access
      await logAccess({
        employeeId: data.employee_id,
        action: 'Homeoffice-Vereinbarung erstellt/aktualisiert',
        module: 'Remote Work',
        category: 'edit',
        details: { changes: data },
      });
      
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homeoffice-agreement', variables.employee_id] });
      queryClient.invalidateQueries({ queryKey: ['access-logs', variables.employee_id] });
    },
  });
};
