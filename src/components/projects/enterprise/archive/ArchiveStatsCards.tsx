import { Archive, CheckCircle, XCircle, Euro } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ArchiveStatsCardsProps {
  archived: number;
  successful: number;
  cancelled: number;
  totalBudget: number;
}

const ArchiveStatsCards = ({ archived, successful, cancelled, totalBudget }: ArchiveStatsCardsProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M €`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K €`;
    }
    return `${value.toLocaleString('de-DE')} €`;
  };

  const stats = [
    {
      label: 'Archiviert',
      value: archived.toString(),
      icon: Archive,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      label: 'Erfolgreich',
      value: successful.toString(),
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Abgebrochen',
      value: cancelled.toString(),
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Gesamt-Budget',
      value: formatCurrency(totalBudget),
      icon: Euro,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArchiveStatsCards;
