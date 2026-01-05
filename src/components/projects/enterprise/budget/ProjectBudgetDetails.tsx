import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectBudgetCard from './ProjectBudgetCard';

interface ProjectBudget {
  id: string;
  name: string;
  category: string;
  costCenter: string;
  owner: string;
  planned: number;
  actual: number;
  actualDeviation: number;
  forecast: number;
  forecastDeviation: number;
  consumedPercent: number;
}

interface ProjectBudgetDetailsProps {
  projects: ProjectBudget[];
}

const ProjectBudgetDetails = ({ projects }: ProjectBudgetDetailsProps) => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Projekt-Budget Details</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectBudgetCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Projekt-Budget-Daten vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetDetails;
