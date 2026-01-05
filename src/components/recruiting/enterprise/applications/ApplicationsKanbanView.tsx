import ApplicationKanbanColumn from './ApplicationKanbanColumn';

interface Application {
  id: string;
  current_stage: string;
  submitted_at: string;
  candidate: {
    first_name: string;
    last_name: string;
  };
  job_posting: {
    title: string;
  };
}

interface ApplicationsKanbanViewProps {
  applications: Application[];
  onCardClick: (application: Application) => void;
}

const columns = [
  { key: 'new', title: 'Eingegangen' },
  { key: 'preselection', title: 'Vorauswahl' },
  { key: 'interview', title: 'Interview' },
  { key: 'assessment', title: 'Assessment' },
  { key: 'decision', title: 'Entscheidung' },
  { key: 'offer', title: 'Angebot' },
  { key: 'hired', title: 'Eingestellt' },
  { key: 'rejected', title: 'Abgelehnt' },
];

const ApplicationsKanbanView = ({ applications, onCardClick }: ApplicationsKanbanViewProps) => {
  const getApplicationsForStage = (stageKey: string) => {
    if (stageKey === 'new') {
      return applications.filter(app => app.current_stage === 'new' || app.current_stage === 'applied' || !app.current_stage);
    }
    return applications.filter(app => app.current_stage === stageKey);
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((column) => (
          <ApplicationKanbanColumn
            key={column.key}
            title={column.title}
            applications={getApplicationsForStage(column.key)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationsKanbanView;
