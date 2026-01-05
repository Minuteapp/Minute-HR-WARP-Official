import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ArchiveHeader from '../archive/ArchiveHeader';
import ArchiveKPICards from '../archive/ArchiveKPICards';
import ArchivedJobsList from '../archive/ArchivedJobsList';
import ArchivedApplicationsList from '../archive/ArchivedApplicationsList';

const ArchiveTab = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: archivedJobs = [] } = useQuery({
    queryKey: ['archived-jobs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('*')
        .in('status', ['filled', 'paused', 'closed']);
      return data || [];
    }
  });

  const { data: archivedApplications = [] } = useQuery({
    queryKey: ['archived-applications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_applications')
        .select('*, candidates(first_name, last_name, email, location), job_postings(title)')
        .in('current_stage', ['hired', 'rejected', 'withdrawn']);
      return (data || []).map(app => ({
        id: app.id,
        candidate_name: app.candidates 
          ? `${app.candidates.first_name} ${app.candidates.last_name}` 
          : 'Unbekannt',
        candidate_email: app.candidates?.email || '-',
        job_title: app.job_postings?.title || '-',
        location: app.candidates?.location || null,
        status: app.current_stage || 'unknown',
        submitted_at: app.submitted_at,
        completed_at: app.updated_at
      }));
    }
  });

  // KPI calculations
  const kpiData = useMemo(() => {
    const archivedJobsCount = archivedJobs.length;
    const archivedApplicationsCount = archivedApplications.length;
    const hiredCandidates = archivedApplications.filter(a => a.status === 'hired').length;

    return { archivedJobsCount, archivedApplicationsCount, hiredCandidates };
  }, [archivedJobs, archivedApplications]);

  // Filtered data
  const filteredJobs = useMemo(() => {
    if (filter === 'applications' || filter === 'hired') return [];
    
    return archivedJobs.filter(job => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.department?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [archivedJobs, filter, search]);

  const filteredApplications = useMemo(() => {
    if (filter === 'jobs') return [];
    
    let filtered = archivedApplications;
    
    if (filter === 'hired') {
      filtered = archivedApplications.filter(a => a.status === 'hired');
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(app => 
        app.candidate_name.toLowerCase().includes(searchLower) ||
        app.job_title.toLowerCase().includes(searchLower) ||
        app.candidate_email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [archivedApplications, filter, search]);

  return (
    <div className="space-y-6">
      <ArchiveHeader 
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />
      
      <ArchiveKPICards 
        archivedJobs={kpiData.archivedJobsCount}
        archivedApplications={kpiData.archivedApplicationsCount}
        hiredCandidates={kpiData.hiredCandidates}
      />

      {(filter === 'all' || filter === 'jobs') && (
        <ArchivedJobsList jobs={filteredJobs} />
      )}

      {(filter === 'all' || filter === 'applications' || filter === 'hired') && (
        <ArchivedApplicationsList applications={filteredApplications} />
      )}
    </div>
  );
};

export default ArchiveTab;
