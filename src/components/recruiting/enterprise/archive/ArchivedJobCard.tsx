import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ArchivedJobCardProps {
  job: {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
    employment_type: string | null;
    status: string;
    created_at: string;
  };
}

const ArchivedJobCard = ({ job }: ArchivedJobCardProps) => {
  const getStatusBadge = () => {
    switch (job.status) {
      case 'filled':
        return <Badge className="bg-foreground text-background">Besetzt</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-muted-foreground">Pausiert</Badge>;
      case 'closed':
        return <Badge variant="outline" className="text-muted-foreground">Geschlossen</Badge>;
      default:
        return <Badge variant="outline">{job.status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
              {getStatusBadge()}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>Abteilung: {job.department || '-'}</span>
              <span>Standort: {job.location || '-'}</span>
              <span>Vertragsart: {job.employment_type || '-'}</span>
              <span>Erstellt: {format(new Date(job.created_at), 'dd.MM.yyyy', { locale: de })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedJobCard;
