import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

interface ReportsKPICardsProps {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  activeApplications: number;
  acceptedOffers: number;
  totalOffers: number;
  hiredCount: number;
  conversionRate: number;
}

const ReportsKPICards = ({
  totalJobs,
  openJobs,
  totalApplications,
  activeApplications,
  acceptedOffers,
  totalOffers,
  hiredCount,
  conversionRate
}: ReportsKPICardsProps) => {
  const kpis = [
    {
      title: 'Gesamt Stellen',
      value: totalJobs.toString(),
      subtitle: `Offen: ${openJobs}`,
      icon: TrendingUp,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Gesamt Bewerbungen',
      value: totalApplications.toString(),
      subtitle: `Aktiv: ${activeApplications}`,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Offer Acceptance',
      value: totalOffers > 0 ? `${Math.round((acceptedOffers / totalOffers) * 100)}%` : '0%',
      subtitle: `${acceptedOffers} / ${totalOffers} Angebote`,
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Einstellungen',
      value: hiredCount.toString(),
      subtitle: `Conversion: ${conversionRate.toFixed(1)}%`,
      icon: Clock,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportsKPICards;
