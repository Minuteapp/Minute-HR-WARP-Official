
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectDetailsCardProps {
  project: any;
}

export const ProjectDetailsCard = ({ project }: ProjectDetailsCardProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };

  const impactScore = project.impact_score || 0;

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Projekt-Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Projekt-ID</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium">{project.project_id || project.id?.substring(0, 8)}</p>
                <Badge className="bg-gray-900 text-white text-xs hover:bg-gray-900">Vorschau</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Startdatum</p>
              <p className="font-medium mt-1">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Standort</p>
              <p className="font-medium mt-1">{project.location || '-'}</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Owner</p>
              <p className="font-medium mt-1">{project.owner_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enddatum</p>
              <p className="font-medium mt-1">{formatDate(project.end_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kostenstelle</p>
              <p className="font-medium mt-1">{project.cost_center || '-'}</p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Sponsor</p>
              <p className="font-medium mt-1">{project.sponsor_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phase</p>
              <Badge variant="outline" className="mt-1">
                {project.phase || '-'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Impact Score</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium">{impactScore}/10</p>
                <Progress 
                  value={impactScore * 10} 
                  className="h-2 flex-1 [&>div]:bg-gray-900" 
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
