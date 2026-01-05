import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, FileText, Calendar } from 'lucide-react';

interface CommunicationStats {
  updates: number;
  documents: number;
  thisWeek: number;
  activeProjects: number;
}

interface CommunicationStatsCardsProps {
  stats: CommunicationStats;
}

const CommunicationStatsCards = ({ stats }: CommunicationStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Updates</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.updates}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Dokumente</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.documents}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <p className="text-sm text-muted-foreground">Diese Woche</p>
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-500">{stats.thisWeek}</p>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aktive Projekte</p>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.activeProjects}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationStatsCards;
