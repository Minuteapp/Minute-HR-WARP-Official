import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { ProjectAchievement } from "@/integrations/supabase/hooks/useEmployeeRecognition";

interface ProjectAchievementsCardProps {
  projects?: ProjectAchievement[];
}

export const ProjectAchievementsCard = ({ projects = [] }: ProjectAchievementsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-600" />
          Besondere Projektleistungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold">{project.project_name}</h4>
                <div className="text-sm text-muted-foreground">{project.role}</div>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                {project.badge_year || project.year}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            
            {/* Impact Metrics */}
            {project.impact_metrics && (
              <div className="flex flex-wrap gap-3 text-xs">
                {Object.entries(project.impact_metrics).map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-gray-900 rounded px-2 py-1">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="ml-1 font-semibold text-indigo-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Keine Projektleistungen vorhanden
          </div>
        )}
      </CardContent>
    </Card>
  );
};
