
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Rocket, Calendar, User, MoreHorizontal, Eye, Edit3, Trash2 } from 'lucide-react';
import { useInnovation } from '@/hooks/useInnovation';
import { PilotProject } from '@/types/innovation';
import { PilotProjectDialog } from './PilotProjectDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export const PilotProjectsList = () => {
  const { pilotProjects, isLoading } = useInnovation();
  const [selectedProject, setSelectedProject] = useState<PilotProject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProjectClick = (project: PilotProject) => {
    console.log('Pilotprojekt geöffnet:', project);
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = (project: PilotProject) => {
    console.log('Pilotprojekt löschen:', project);
    toast.info('Löschfunktion wird implementiert...');
  };

  const handleViewDetails = (project: PilotProject, e: React.MouseEvent) => {
    e.stopPropagation();
    handleProjectClick(project);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Lade Pilotprojekte...
        </div>
      </div>
    );
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'pilot_phase': return 'bg-blue-100 text-blue-800';
      case 'scaling': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preparing': return 'Vorbereitung';
      case 'pilot_phase': return 'Pilotphase';
      case 'scaling': return 'Skalierung';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {pilotProjects.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Pilotprojekte</h3>
              <p className="text-muted-foreground">
                Es wurden noch keine Pilotprojekte erstellt. Starten Sie Ihr erstes Pilotprojekt!
              </p>
            </CardContent>
          </Card>
        ) : (
          pilotProjects.map((project: PilotProject) => (
            <Card 
              key={project.id} 
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-muted/5"
              onClick={() => handleProjectClick(project)}
            >
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Rocket className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleViewDetails(project, e)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleViewDetails(project, e)}
                          className="cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project);
                          }}
                          className="cursor-pointer text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {new Date(project.start_date).toLocaleDateString('de-DE')}</span>
                    </div>
                    {project.end_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Ende: {new Date(project.end_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{project.responsible_person}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {project.success_metrics && project.success_metrics.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Erfolgskriterien</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {project.success_metrics.slice(0, 3).map((metric: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            {metric}
                          </li>
                        ))}
                        {project.success_metrics.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            ... und {project.success_metrics.length - 3} weitere
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleViewDetails(project, e)}
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details anzeigen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pilot Project Dialog */}
      <PilotProjectDialog
        project={selectedProject}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
};
