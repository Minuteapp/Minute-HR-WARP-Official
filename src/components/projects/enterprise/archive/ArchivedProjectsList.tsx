import ArchivedProjectCard from './ArchivedProjectCard';
import { toast } from 'sonner';

interface ArchivedProject {
  id: string;
  name: string;
  category: string;
  status: 'completed' | 'cancelled';
  projectId: string;
  archivedDate: string;
  duration: string;
  owner: string;
  finalBudget: number;
  budgetVariance: number;
  achievements: string[];
  lessonsLearned: string;
}

interface ArchivedProjectsListProps {
  projects: ArchivedProject[];
}

const ArchivedProjectsList = ({ projects }: ArchivedProjectsListProps) => {
  const handleViewDetails = (name: string) => {
    toast.info(`Details für "${name}" werden geladen...`);
  };

  const handleViewDocumentation = (name: string) => {
    toast.info(`Dokumentation für "${name}" wird geöffnet...`);
  };

  const handleUseAsTemplate = (name: string) => {
    toast.success(`"${name}" wird als Template verwendet...`);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Keine archivierten Projekte gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ArchivedProjectCard
          key={project.id}
          {...project}
          onViewDetails={() => handleViewDetails(project.name)}
          onViewDocumentation={() => handleViewDocumentation(project.name)}
          onUseAsTemplate={() => handleUseAsTemplate(project.name)}
        />
      ))}
    </div>
  );
};

export default ArchivedProjectsList;
