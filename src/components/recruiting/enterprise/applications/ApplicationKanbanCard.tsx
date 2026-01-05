import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ApplicationKanbanCardProps {
  application: {
    id: string;
    submitted_at: string;
    candidate: {
      first_name: string;
      last_name: string;
    };
    job_posting: {
      title: string;
    };
  };
  onClick: () => void;
}

const ApplicationKanbanCard = ({ application, onClick }: ApplicationKanbanCardProps) => {
  const candidateName = `${application.candidate?.first_name || ''} ${application.candidate?.last_name || ''}`.trim() || 'Unbekannt';
  const jobTitle = application.job_posting?.title || 'Keine Stelle';
  const submittedDate = application.submitted_at 
    ? format(new Date(application.submitted_at), 'dd. MMM yyyy', { locale: de })
    : '';

  return (
    <div 
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <p className="font-medium text-foreground text-sm">{candidateName}</p>
      <p className="text-xs text-muted-foreground mt-1">{jobTitle}</p>
      {submittedDate && (
        <p className="text-xs text-muted-foreground mt-2">{submittedDate}</p>
      )}
    </div>
  );
};

export default ApplicationKanbanCard;
