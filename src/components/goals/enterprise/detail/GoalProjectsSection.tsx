import { Card, CardContent } from "@/components/ui/card";
import { Link2, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface GoalProjectsSectionProps {
  projects: Project[];
}

export const GoalProjectsSection = ({ projects }: GoalProjectsSectionProps) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">Verknüpfte Projekte ({projects.length})</span>
      </div>
      
      <div className="space-y-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{project.name}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
