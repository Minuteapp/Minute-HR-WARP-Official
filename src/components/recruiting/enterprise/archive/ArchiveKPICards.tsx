import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, Archive } from 'lucide-react';

interface ArchiveKPICardsProps {
  archivedJobs: number;
  archivedApplications: number;
  hiredCandidates: number;
}

const ArchiveKPICards = ({ archivedJobs, archivedApplications, hiredCandidates }: ArchiveKPICardsProps) => {
  const kpis = [
    {
      title: 'Archivierte Stellen',
      value: archivedJobs,
      icon: Briefcase,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground'
    },
    {
      title: 'Archivierte Bewerbungen',
      value: archivedApplications,
      icon: Users,
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground'
    },
    {
      title: 'Eingestellte Kandidaten',
      value: hiredCandidates,
      icon: Archive,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
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

export default ArchiveKPICards;
