import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import TalentPoolHeader from '../talentpool/TalentPoolHeader';
import TalentPoolKPICards from '../talentpool/TalentPoolKPICards';
import TalentPoolCard from '../talentpool/TalentPoolCard';
import { Award } from 'lucide-react';

const TalentPoolTab = () => {
  const { tenantCompany } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['talentpool-candidates', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const filteredCandidates = candidates.filter((c: any) => 
    !searchQuery || 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const activeCount = candidates.filter((c: any) => c.gdpr_consent && (!c.gdpr_retention_until || new Date(c.gdpr_retention_until) > now)).length;
  const expiringCount = candidates.filter((c: any) => c.gdpr_retention_until && new Date(c.gdpr_retention_until) > now && new Date(c.gdpr_retention_until) <= in30Days).length;
  const expiredCount = candidates.filter((c: any) => c.gdpr_retention_until && new Date(c.gdpr_retention_until) < now).length;

  return (
    <div>
      <TalentPoolHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <TalentPoolKPICards totalCount={candidates.length} activeCount={activeCount} expiringCount={expiringCount} expiredCount={expiredCount} />
      
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Lade Talentpool...</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Talentpool ist leer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredCandidates.map((c: any) => (
            <TalentPoolCard key={c.id} candidate={c} onContact={() => {}} onRemove={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentPoolTab;
