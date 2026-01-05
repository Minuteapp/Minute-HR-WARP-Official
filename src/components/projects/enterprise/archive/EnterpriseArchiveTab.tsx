import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ArchiveHeader from './ArchiveHeader';
import ArchiveStatsCards from './ArchiveStatsCards';
import ArchiveFilters from './ArchiveFilters';
import ArchivedProjectsList from './ArchivedProjectsList';

const EnterpriseArchiveTab = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch archived projects
  const { data: archivedProjects } = useQuery({
    queryKey: ['archived-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['completed', 'cancelled', 'archived'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(project => ({
        id: project.id,
        name: project.name,
        category: project.category || 'Allgemein',
        status: (project.status === 'cancelled' ? 'cancelled' : 'completed') as 'completed' | 'cancelled',
        projectId: `PRJ-${project.id.slice(0, 8).toUpperCase()}`,
        archivedDate: project.updated_at,
        duration: project.start_date && project.end_date 
          ? `${Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} Monate`
          : 'N/A',
        owner: project.owner || 'Nicht zugewiesen',
        finalBudget: project.budget || 0,
        budgetVariance: 0, // Would need actual_cost field
        achievements: [],
        lessonsLearned: '',
      }));
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    const projects = archivedProjects || [];
    return {
      archived: projects.length,
      successful: projects.filter(p => p.status === 'completed').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      totalBudget: projects.reduce((acc, p) => acc + p.finalBudget, 0),
    };
  }, [archivedProjects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let projects = archivedProjects || [];

    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.projectId.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      projects = projects.filter(p => p.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      projects = projects.filter(p => p.category === typeFilter);
    }

    return projects;
  }, [archivedProjects, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <ArchiveHeader />

      <ArchiveStatsCards
        archived={stats.archived}
        successful={stats.successful}
        cancelled={stats.cancelled}
        totalBudget={stats.totalBudget}
      />

      <ArchiveFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        type={typeFilter}
        onTypeChange={setTypeFilter}
      />

      <ArchivedProjectsList projects={filteredProjects} />
    </div>
  );
};

export default EnterpriseArchiveTab;
