import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const CandidatesWithoutConsent = () => {
  const { tenantCompany } = useTenant();

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates-without-consent', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];
      const { data, error } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, email, gdpr_consent')
        .eq('company_id', tenantCompany.id)
        .eq('gdpr_consent', false)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kandidaten ohne Einwilligung</CardTitle>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Alle Kandidaten haben eine gültige Einwilligung.
          </p>
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate: any) => (
              <div key={candidate.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <span className="font-medium">{candidate.first_name} {candidate.last_name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{candidate.email}</span>
                </div>
                <Badge variant="destructive">Keine Einwilligung</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidatesWithoutConsent;
