import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ApplicationStatusBadge from './ApplicationStatusBadge';

interface Application {
  id: string;
  current_stage: string;
  submitted_at: string;
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    location?: string;
    source?: string;
    gdpr_consent?: boolean;
  };
  job_posting: {
    id: string;
    title: string;
    location?: string;
    department?: string;
    employment_type?: string;
  };
}

interface ApplicationsTableViewProps {
  applications: Application[];
  onDetailsClick: (application: Application) => void;
}

const ApplicationsTableView = ({ applications, onDetailsClick }: ApplicationsTableViewProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">KANDIDAT</TableHead>
            <TableHead className="font-semibold">STELLE</TableHead>
            <TableHead className="font-semibold">STATUS</TableHead>
            <TableHead className="font-semibold">EINGEGANGEN AM</TableHead>
            <TableHead className="font-semibold">QUELLE</TableHead>
            <TableHead className="font-semibold">AKTIONEN</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => {
            const candidateName = `${application.candidate?.first_name || ''} ${application.candidate?.last_name || ''}`.trim();
            const candidateEmail = application.candidate?.email || '';
            const jobTitle = application.job_posting?.title || 'Keine Stelle';
            const jobLocation = application.job_posting?.location || '';
            const submittedDate = application.submitted_at 
              ? format(new Date(application.submitted_at), 'dd.MM.yyyy', { locale: de })
              : '-';
            const source = application.candidate?.source || '-';

            return (
              <TableRow key={application.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{candidateName || 'Unbekannt'}</p>
                    <p className="text-sm text-muted-foreground">{candidateEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{jobTitle}</p>
                    {jobLocation && (
                      <p className="text-sm text-muted-foreground">{jobLocation}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ApplicationStatusBadge status={application.current_stage || 'new'} />
                </TableCell>
                <TableCell className="text-muted-foreground">{submittedDate}</TableCell>
                <TableCell className="text-muted-foreground">{source}</TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDetailsClick(application)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Keine Bewerbungen vorhanden
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationsTableView;
