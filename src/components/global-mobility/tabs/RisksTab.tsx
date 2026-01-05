import { useState } from 'react';
import { RisksHeader } from '../risks/RisksHeader';
import { RisksKPICards } from '../risks/RisksKPICards';
import { RisksTable } from '../risks/RisksTable';
import { RiskNotificationsSection } from '../risks/RiskNotificationsSection';
import { RiskDetailsModal } from '../risks/RiskDetailsModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface Risk {
  id: string;
  employee_name: string;
  category: string;
  risk_description: string;
  risk_level: string;
  deadline: string | null;
  responsible_person: string | null;
  status: string | null;
  created_at: string;
}

export function RisksTab() {
  const { tenantCompany } = useTenant();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  // Lade Risiken aus der Datenbank
  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['mobility-risks', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      
      const { data, error } = await supabase
        .from('mobility_risks')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching mobility risks:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  const criticalCount = risks.filter(r => r.risk_level === 'critical').length;
  const highCount = risks.filter(r => r.risk_level === 'high').length;
  const mediumCount = risks.filter(r => r.risk_level === 'medium').length;
  const lowCount = risks.filter(r => r.risk_level === 'low').length;

  const handleViewDetails = (risk: Risk) => {
    setSelectedRisk(risk);
  };

  if (!tenantCompany?.id) {
    return (
      <div className="space-y-6">
        <RisksHeader />
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Bitte wählen Sie eine Firma aus, um Risiken anzuzeigen.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <RisksHeader />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RisksHeader />
      
      <RisksKPICards
        criticalCount={criticalCount}
        highCount={highCount}
        mediumCount={mediumCount}
        lowCount={lowCount}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Aktive Risiken</CardTitle>
            </CardHeader>
            <CardContent>
              <RisksTable
                risks={risks}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <RiskNotificationsSection />
        </div>
      </div>

      <RiskDetailsModal
        risk={selectedRisk}
        open={!!selectedRisk}
        onOpenChange={(open) => !open && setSelectedRisk(null)}
      />
    </div>
  );
}
