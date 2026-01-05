import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioFilters } from './PortfolioFilters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AIPortfolioSummary } from './AIPortfolioSummary';
import { PortfolioKPIGrid } from './PortfolioKPIGrid';
import { PortfolioHeatmap } from './PortfolioHeatmap';
import { BudgetVsProgressChart } from './BudgetVsProgressChart';
import { ProjectStatusPieChart } from './ProjectStatusPieChart';
import { TopCriticalProjects } from './TopCriticalProjects';
import { AIRecommendations } from './AIRecommendations';

export const PortfolioView = () => {
  const { user } = useAuth();
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterOKR, setFilterOKR] = useState('all');
  const [showOKROverlay, setShowOKROverlay] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portfolio-projects', filterDepartment, filterLocation, filterProgram, filterOKR],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      return data || [];
    }
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-muted-foreground">Portfolio-Daten werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortfolioFilters
        department={filterDepartment}
        onDepartmentChange={setFilterDepartment}
        location={filterLocation}
        onLocationChange={setFilterLocation}
        program={filterProgram}
        onProgramChange={setFilterProgram}
        okr={filterOKR}
        onOKRChange={setFilterOKR}
        onShowOKROverlay={() => setShowOKROverlay(true)}
      />
      
      <AIPortfolioSummary projects={projects} />
      
      <PortfolioKPIGrid projects={projects} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioHeatmap projects={projects} />
        <BudgetVsProgressChart projects={projects} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectStatusPieChart projects={projects} />
        <TopCriticalProjects projects={projects} />
      </div>
      
      <AIRecommendations projects={projects} />
    </div>
  );
};
