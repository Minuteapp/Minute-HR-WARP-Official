import ArchivedJobCard from './ArchivedJobCard';

interface Job {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  status: string;
  created_at: string;
}

interface ArchivedJobsListProps {
  jobs: Job[];
}

const ArchivedJobsList = ({ jobs }: ArchivedJobsListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine archivierten Stellen gefunden
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Archivierte Stellen</h3>
      <div className="space-y-3">
        {jobs.map((job) => (
          <ArchivedJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default ArchivedJobsList;
