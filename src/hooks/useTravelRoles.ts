import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TravelRoleDefinition {
  id: string;
  role_key: string;
  role_name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  main_features: string[];
  stats_config: Record<string, boolean>;
  sort_order: number;
  is_active: boolean;
}

export interface TravelRolePermission {
  id: string;
  role_key: string;
  category: string;
  category_icon: string | null;
  feature_key: string;
  feature_label: string;
  granted: boolean;
  sort_order: number;
}

export interface PermissionCategory {
  category: string;
  category_icon: string | null;
  permissions: TravelRolePermission[];
}

export function useTravelRoles() {
  return useQuery({
    queryKey: ['travel-role-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_role_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(role => ({
        ...role,
        main_features: Array.isArray(role.main_features) ? role.main_features : [],
        stats_config: typeof role.stats_config === 'object' && role.stats_config !== null 
          ? role.stats_config as Record<string, boolean>
          : {}
      })) as TravelRoleDefinition[];
    }
  });
}

export function useTravelRolePermissions(roleKey?: string) {
  return useQuery({
    queryKey: ['travel-role-permissions', roleKey],
    queryFn: async () => {
      let query = supabase
        .from('travel_role_permissions')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (roleKey) {
        query = query.eq('role_key', roleKey);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as TravelRolePermission[];
    }
  });
}

export function useAllTravelRolePermissions() {
  return useQuery({
    queryKey: ['all-travel-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travel_role_permissions')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as TravelRolePermission[];
    }
  });
}

export function usePermissionsByCategory(roleKey: string) {
  const { data: permissions, isLoading, error } = useTravelRolePermissions(roleKey);
  
  const categories = permissions?.reduce((acc, perm) => {
    const existingCategory = acc.find(c => c.category === perm.category);
    if (existingCategory) {
      existingCategory.permissions.push(perm);
    } else {
      acc.push({
        category: perm.category,
        category_icon: perm.category_icon,
        permissions: [perm]
      });
    }
    return acc;
  }, [] as PermissionCategory[]);
  
  return { categories, isLoading, error };
}

// Category display names
export const CATEGORY_LABELS: Record<string, string> = {
  dashboard: 'Dashboard & Übersicht',
  travel_requests: 'Reiseanträge',
  expenses: 'Spesenabrechnung',
  employee_management: 'Mitarbeiterverwaltung',
  reporting: 'Reporting & Analytics',
  administration: 'Verwaltung & Einstellungen',
  additional: 'Zusatzfunktionen'
};

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  dashboard: 'layout-dashboard',
  travel_requests: 'plane',
  expenses: 'receipt',
  employee_management: 'users',
  reporting: 'bar-chart-3',
  administration: 'settings',
  additional: 'sparkles'
};