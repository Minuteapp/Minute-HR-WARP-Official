import ApplicationKanbanCard from './ApplicationKanbanCard';

interface Application {
  id: string;
  submitted_at: string;
  candidate: {
    first_name: string;
    last_name: string;
  };
  job_posting: {
    title: string;
  };
}

interface ApplicationKanbanColumnProps {
  title: string;
  applications: Application[];
  onCardClick: (application: Application) => void;
}

const ApplicationKanbanColumn = ({ title, applications, onCardClick }: ApplicationKanbanColumnProps) => {
  return (
    <div className="flex-shrink-0 w-72 bg-muted/30 rounded-lg">
      <div className="p-3 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">{title}</h3>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {applications.length}
          </span>
        </div>
      </div>
      
      <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {applications.map((application) => (
          <ApplicationKanbanCard
            key={application.id}
            application={application}
            onClick={() => onCardClick(application)}
          />
        ))}
        
        {applications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Keine Bewerbungen
          </p>
        )}
      </div>
    </div>
  );
};

export default ApplicationKanbanColumn;
