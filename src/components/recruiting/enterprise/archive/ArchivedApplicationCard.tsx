import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ArchivedApplicationCardProps {
  application: {
    id: string;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    location: string | null;
    status: string;
    submitted_at: string;
    completed_at?: string;
  };
}

const ArchivedApplicationCard = ({ application }: ArchivedApplicationCardProps) => {
  const getStatusBadge = () => {
    if (application.status === 'hired') {
      return <Badge className="bg-green-500 text-white">Eingestellt</Badge>;
    }
    if (application.status === 'rejected') {
      return <Badge variant="outline" className="text-muted-foreground">Abgelehnt</Badge>;
    }
    return <Badge variant="outline">{application.status}</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground truncate">{application.candidate_name}</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground mb-2">Stelle: {application.job_title}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>E-Mail: {application.candidate_email}</span>
              <span>Standort: {application.location || '-'}</span>
              {application.completed_at && (
                <span>Abgeschlossen: {format(new Date(application.completed_at), 'dd.MM.yyyy', { locale: de })}</span>
              )}
              <span>Beworben am: {format(new Date(application.submitted_at), 'dd.MM.yyyy', { locale: de })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArchivedApplicationCard;
