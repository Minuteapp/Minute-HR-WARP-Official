import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AbsenceFilters {
  status?: string[];
  types?: string[];
  departments?: string[];
  dateRange?: { start: Date; end: Date };
  employees?: string[];
  priority?: string;
  searchTerm?: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface AbsenceDataContextType {
  requests: any[];
  isLoading: boolean;
  error: any;
  filters: AbsenceFilters;
  pagination: PaginationState;
  updateFilters: (newFilters: Partial<AbsenceFilters>) => void;
  updatePagination: (newPagination: Partial<PaginationState>) => void;
  resetFilters: () => void;
  refreshData: () => void;
  selectedRequests: string[];
  setSelectedRequests: (ids: string[]) => void;
  bulkAction: (action: string, requestIds: string[]) => Promise<void>;
}

const AbsenceDataContext = createContext<AbsenceDataContextType | null>(null);

export const useAbsenceData = () => {
  const context = useContext(AbsenceDataContext);
  if (!context) {
    throw new Error('useAbsenceData must be used within AbsenceDataProvider');
  }
  return context;
};

interface AbsenceDataProviderProps {
  children: React.ReactNode;
}

export const AbsenceDataProvider: React.FC<AbsenceDataProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AbsenceFilters>({});
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0
  });
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Build query based on filters and pagination
  const buildQuery = () => {
    let query = supabase
      .from('absence_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }
    if (filters.types?.length) {
      query = query.in('type', filters.types);
    }
    if (filters.departments?.length) {
      query = query.in('department', filters.departments);
    }
    if (filters.dateRange) {
      query = query
        .gte('start_date', filters.dateRange.start.toISOString())
        .lte('end_date', filters.dateRange.end.toISOString());
    }
    if (filters.searchTerm) {
      query = query.or(`employee_name.ilike.%${filters.searchTerm}%,reason.ilike.%${filters.searchTerm}%`);
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to);

    return query;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['absence-requests-paginated', filters, pagination.page, pagination.pageSize],
    queryFn: async () => {
      const { data, count, error } = await buildQuery();
      if (error) throw error;
      
      // Update total count
      setPagination(prev => ({ ...prev, total: count || 0 }));
      
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });

  const updateFilters = (newFilters: Partial<AbsenceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const updatePagination = (newPagination: Partial<PaginationState>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const resetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedRequests([]);
  };

  const refreshData = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
  };

  const bulkAction = async (action: string, requestIds: string[]) => {
    try {
      if (action === 'approve') {
        await supabase
          .from('absence_requests')
          .update({ 
            status: 'approved', 
            approved_at: new Date().toISOString(),
            approved_by: (await supabase.auth.getUser()).data.user?.id 
          })
          .in('id', requestIds);
      } else if (action === 'reject') {
        await supabase
          .from('absence_requests')
          .update({ 
            status: 'rejected', 
            rejected_at: new Date().toISOString(),
            rejected_by: (await supabase.auth.getUser()).data.user?.id 
          })
          .in('id', requestIds);
      } else if (action === 'delete') {
        await supabase
          .from('absence_requests')
          .delete()
          .in('id', requestIds);
      }
      
      refreshData();
      setSelectedRequests([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      throw error;
    }
  };

  const value: AbsenceDataContextType = {
    requests: data || [],
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    resetFilters,
    refreshData,
    selectedRequests,
    setSelectedRequests,
    bulkAction
  };

  return (
    <AbsenceDataContext.Provider value={value}>
      {children}
    </AbsenceDataContext.Provider>
  );
};