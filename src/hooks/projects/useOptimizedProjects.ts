
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';

export const useOptimizedProjects = (filters?: {
  status?: string;
  priority?: string;
  search?: string;
}) => {
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.search && filters.search.trim()) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(project => ({
        id: project.id,
        name: project.name || '',
        description: project.description || '',
        startDate: project.start_date || '',
        dueDate: project.end_date || '',
        status: (project.status as Project['status']) || 'pending',
        priority: (project.priority as 'high' | 'medium' | 'low') || 'medium',
        budget: project.budget || 0,
        costCenter: project.cost_center || '',
        category: project.category || '',
        progress: project.progress || 0,
        responsiblePerson: project.owner_id || '',
        teamMembers: project.team_members || [],
        createdAt: project.created_at || new Date().toISOString()
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten
    gcTime: 10 * 60 * 1000, // 10 Minuten
  });

  // Memoized computations
  const projectStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const delayed = projects.filter(p => {
      if (p.status !== 'active') return false;
      const endDate = new Date(p.dueDate);
      const today = new Date();
      return endDate < today && p.progress < 100;
    }).length;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgProgress = total > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total 
      : 0;

    return {
      total,
      active,
      completed,
      delayed,
      totalBudget,
      avgProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [projects]);

  const projectsByStatus = useMemo(() => {
    return projects.reduce((acc, project) => {
      const status = project.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);

  const projectsByPriority = useMemo(() => {
    return projects.reduce((acc, project) => {
      const priority = project.priority;
      if (!acc[priority]) acc[priority] = [];
      acc[priority].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);

  // Optimized callbacks
  const refreshProjects = useCallback(() => {
    refetch();
  }, [refetch]);

  const getProjectById = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const getProjectsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return projects.filter(project => {
      if (!project.dueDate) return false;
      const projectEndDate = new Date(project.dueDate);
      return projectEndDate >= startDate && projectEndDate <= endDate;
    });
  }, [projects]);

  return {
    projects,
    isLoading,
    error,
    projectStats,
    projectsByStatus,
    projectsByPriority,
    refreshProjects,
    getProjectById,
    getProjectsByDateRange
  };
};
