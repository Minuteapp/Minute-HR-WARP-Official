import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DependenciesHeader from './DependenciesHeader';
import RiskStatsCards from './RiskStatsCards';
import RiskRegister from './RiskRegister';

interface RiskStats {
  totalRisks: number;
  openRisks: number;
  criticalHigh: number;
  mitigated: number;
}

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'in-progress' | 'identified' | 'mitigated';
  projectName: string;
  owner: string;
  impact: number;
  mitigationStrategy: string;
}

const EnterpriseDependenciesTab = () => {
  const [stats, setStats] = useState<RiskStats>({
    totalRisks: 0,
    openRisks: 0,
    criticalHigh: 0,
    mitigated: 0,
  });
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const { data: riskData } = await supabase
          .from('project_risks')
          .select(`
            id,
            title,
            description,
            severity,
            status,
            impact,
            mitigation,
            owner_id,
            project_id,
            projects:project_id (name),
            profiles:owner_id (full_name)
          `);

        if (riskData && riskData.length > 0) {
          const mappedRisks: RiskItem[] = riskData.map(r => {
            const projectData = r.projects as unknown as { name: string } | null;
            const profileData = r.profiles as unknown as { full_name: string } | null;
            
            return {
              id: r.id,
              title: r.title || 'Unbenanntes Risiko',
              description: r.description || '',
              severity: (r.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium',
              status: (r.status as 'in-progress' | 'identified' | 'mitigated') || 'identified',
              projectName: projectData?.name || 'Kein Projekt',
              owner: profileData?.full_name || 'Nicht zugewiesen',
              impact: r.impact || 5,
              mitigationStrategy: r.mitigation || 'Keine Strategie definiert',
            };
          });

          setRisks(mappedRisks);

          // Calculate stats
          const total = mappedRisks.length;
          const open = mappedRisks.filter(r => r.status !== 'mitigated').length;
          const critHigh = mappedRisks.filter(r => r.severity === 'critical' || r.severity === 'high').length;
          const mitigated = mappedRisks.filter(r => r.status === 'mitigated').length;

          setStats({
            totalRisks: total,
            openRisks: open,
            criticalHigh: critHigh,
            mitigated: mitigated,
          });
        }
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DependenciesHeader />
        <div className="text-center py-12 text-muted-foreground">Lädt Risiko-Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DependenciesHeader />
      <RiskStatsCards stats={stats} />
      <RiskRegister risks={risks} />
    </div>
  );
};

export default EnterpriseDependenciesTab;
