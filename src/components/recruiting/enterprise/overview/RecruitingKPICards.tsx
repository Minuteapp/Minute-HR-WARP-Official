import { Building, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';

const RecruitingKPICards = () => {
  const { tenantCompany } = useTenant();

  const { data: openPositions, isLoading: loadingPositions } = useQuery({
    queryKey: ['recruiting-kpi-open-positions', tenantCompany?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenantCompany?.id,
  });

  const { data: activeApplications, isLoading: loadingApplications } = useQuery({
    queryKey: ['recruiting-kpi-applications', tenantCompany?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'rejected');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tenantCompany?.id,
  });

  const { data: timeToHire, isLoading: loadingTimeToHire } = useQuery({
    queryKey: ['recruiting-kpi-time-to-hire', tenantCompany?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('created_at, hired_at')
        .eq('status', 'hired')
        .not('hired_at', 'is', null);
      
      if (error) throw error;
      if (!data || data.length === 0) return 0;
      
      const totalDays = data.reduce((sum, app) => {
        const created = new Date(app.created_at);
        const hired = new Date(app.hired_at!);
        const diffDays = Math.ceil((hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      
      return Math.round(totalDays / data.length);
    },
    enabled: !!tenantCompany?.id,
  });

  const { data: offerAcceptanceRate, isLoading: loadingAcceptance } = useQuery({
    queryKey: ['recruiting-kpi-offer-acceptance', tenantCompany?.id],
    queryFn: async () => {
      const { data: offers, error: offersError } = await supabase
        .from('applications')
        .select('status')
        .in('status', ['offered', 'hired', 'offer_declined']);
      
      if (offersError) throw offersError;
      if (!offers || offers.length === 0) return 0;
      
      const accepted = offers.filter(o => o.status === 'hired').length;
      return Math.round((accepted / offers.length) * 100);
    },
    enabled: !!tenantCompany?.id,
  });

  const kpiCards = [
    {
      title: 'Offene Stellen',
      value: openPositions ?? 0,
      icon: Building,
      iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      isLoading: loadingPositions,
    },
    {
      title: 'Aktive Bewerbungen',
      value: activeApplications ?? 0,
      icon: Users,
      iconBgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      isLoading: loadingApplications,
    },
    {
      title: 'Time-to-Hire',
      value: `${timeToHire ?? 0} Tage`,
      icon: Clock,
      iconBgColor: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      isLoading: loadingTimeToHire,
    },
    {
      title: 'Offer-Acceptance-Rate',
      value: `${offerAcceptanceRate ?? 0}%`,
      icon: CheckCircle,
      iconBgColor: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      isLoading: loadingAcceptance,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((kpi) => (
        <Card key={kpi.title} className="border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.iconBgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.title}</p>
                {kpi.isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecruitingKPICards;
