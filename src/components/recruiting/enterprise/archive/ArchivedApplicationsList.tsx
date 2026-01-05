import ArchivedApplicationCard from './ArchivedApplicationCard';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  location: string | null;
  status: string;
  submitted_at: string;
  completed_at?: string;
}

interface ArchivedApplicationsListProps {
  applications: Application[];
}

const ArchivedApplicationsList = ({ applications }: ArchivedApplicationsListProps) => {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine archivierten Bewerbungen gefunden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Archivierte Bewerbungen</h3>
      <div className="space-y-3">
        {applications.map((application) => (
          <ArchivedApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  );
};

export default ArchivedApplicationsList;
