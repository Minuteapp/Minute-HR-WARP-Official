
import { useProjects } from "@/hooks/projects/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

export const TimelineView = () => {
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const sortedProjects = projects.sort((a, b) => {
    const dateA = new Date(a.start_date || a.created_at);
    const dateB = new Date(b.start_date || b.created_at);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-4">
      {sortedProjects.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Projekte vorhanden</h3>
          <p className="text-gray-500">Erstellen Sie ein Projekt, um es hier in der Timeline zu sehen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProjects.map((project) => (
            <Card key={project.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'}
                  >
                    {project.status === 'active' ? 'Aktiv' : project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.description && (
                    <p className="text-gray-600 text-sm">{project.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {project.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {new Date(project.start_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                    
                    {project.end_date && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Ende: {new Date(project.end_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                  </div>
                  
                  {project.progress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Fortschritt</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
