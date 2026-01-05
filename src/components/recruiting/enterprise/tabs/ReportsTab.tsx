import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ReportsHeader from '../reports/ReportsHeader';
import ReportsKPICards from '../reports/ReportsKPICards';
import TimeToHireChart from '../reports/TimeToHireChart';
import ApplicationsBySourceChart from '../reports/ApplicationsBySourceChart';
import ApplicationStatusChart from '../reports/ApplicationStatusChart';
import JobsByLocationChart from '../reports/JobsByLocationChart';
import RecruitingFunnelChart from '../reports/RecruitingFunnelChart';

const ReportsTab = () => {
  const { data: jobs = [] } = useQuery({
    queryKey: ['recruiting-jobs-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_postings')
        .select('*');
      return data || [];
    }
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['recruiting-applications-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_applications')
        .select('*, job_postings(title, department, location)');
      return data || [];
    }
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['recruiting-candidates-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*');
      return data || [];
    }
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['recruiting-offers-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('job_offers')
        .select('*');
      return data || [];
    }
  });

  // KPI calculations
  const kpiData = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(j => j.status === 'open').length;
    const totalApplications = applications.length;
    const activeApplications = applications.filter(a => 
      ['new', 'screening', 'interview', 'assessment'].includes(a.current_stage || '')
    ).length;
    const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
    const totalOffers = offers.length;
    const hiredCount = applications.filter(a => a.current_stage === 'hired').length;
    const conversionRate = totalApplications > 0 ? (hiredCount / totalApplications) * 100 : 0;

    return {
      totalJobs, openJobs, totalApplications, activeApplications,
      acceptedOffers, totalOffers, hiredCount, conversionRate
    };
  }, [jobs, applications, offers]);

  // Time to Hire by Department
  const timeToHireData = useMemo(() => {
    const departmentMap = new Map<string, number[]>();
    
    applications.forEach(app => {
      if (app.current_stage === 'hired' && app.job_postings?.department) {
        const dept = app.job_postings.department;
        const submittedAt = new Date(app.submitted_at);
        const now = new Date();
        const days = Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, []);
        }
        departmentMap.get(dept)?.push(days);
      }
    });

    return Array.from(departmentMap.entries()).map(([department, days]) => ({
      department,
      days: Math.round(days.reduce((a, b) => a + b, 0) / days.length)
    }));
  }, [applications]);

  // Applications by Source
  const sourceData = useMemo(() => {
    const sourceMap = new Map<string, number>();
    
    candidates.forEach(candidate => {
      const source = candidate.source || 'unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    return Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  // Application Status Chart
  const statusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    
    applications.forEach(app => {
      const status = app.current_stage || 'unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
  }, [applications]);

  // Jobs by Location
  const locationData = useMemo(() => {
    const locationMap = new Map<string, number>();
    
    jobs.forEach(job => {
      const location = job.location || 'Unbekannt';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
    });

    return Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  // Recruiting Funnel
  const funnelStages = useMemo(() => {
    const stages = [
      { name: 'Eingegangen', key: 'new' },
      { name: 'Screening', key: 'screening' },
      { name: 'Interview', key: 'interview' },
      { name: 'Angebot', key: 'offer' },
      { name: 'Eingestellt', key: 'hired' }
    ];

    const total = applications.length;
    
    return stages.map(stage => {
      let count = 0;
      if (stage.key === 'new') {
        count = total;
      } else if (stage.key === 'screening') {
        count = applications.filter(a => 
          ['screening', 'assessment', 'interview', 'decision', 'offer', 'hired'].includes(a.current_stage || '')
        ).length;
      } else if (stage.key === 'interview') {
        count = applications.filter(a => 
          ['interview', 'decision', 'offer', 'hired'].includes(a.current_stage || '')
        ).length;
      } else if (stage.key === 'offer') {
        count = applications.filter(a => 
          ['offer', 'hired'].includes(a.current_stage || '')
        ).length;
      } else if (stage.key === 'hired') {
        count = applications.filter(a => a.current_stage === 'hired').length;
      }

      return {
        name: stage.name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }, [applications]);

  return (
    <div className="space-y-6">
      <ReportsHeader />
      
      <ReportsKPICards {...kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeToHireChart data={timeToHireData} />
        <ApplicationsBySourceChart data={sourceData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationStatusChart data={statusData} />
        <JobsByLocationChart data={locationData} />
      </div>

      <RecruitingFunnelChart stages={funnelStages} />
    </div>
  );
};

export default ReportsTab;
