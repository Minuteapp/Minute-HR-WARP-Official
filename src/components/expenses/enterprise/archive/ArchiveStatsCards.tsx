
import { Card, CardContent } from '@/components/ui/card';
import { Archive, Calendar, Euro, Clock } from 'lucide-react';

interface ArchiveStats {
  totalArchived: number;
  thisYear: number;
  totalVolume: number;
  retentionPeriod: string;
}

interface ArchiveStatsCardsProps {
  stats: ArchiveStats;
}

const ArchiveStatsCards = ({ stats }: ArchiveStatsCardsProps) => {
  const cards = [
    {
      title: 'Archivierte Ausgaben',
      value: stats.totalArchived.toLocaleString('de-DE'),
      icon: Archive,
    },
    {
      title: 'Dieses Jahr',
      value: stats.thisYear.toLocaleString('de-DE'),
      icon: Calendar,
    },
    {
      title: 'Gesamtvolumen',
      value: `€${stats.totalVolume.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      icon: Euro,
    },
    {
      title: 'Aufbewahrungsfrist',
      value: stats.retentionPeriod,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <card.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArchiveStatsCards;
