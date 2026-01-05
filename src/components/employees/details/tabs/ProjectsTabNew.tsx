import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/employee-tabs/useProjects';
import { ProjectDialog } from '../dialogs/ProjectDialog';
import { Plus, Edit, Trash2, Users, TrendingUp, CheckCircle2, Folder } from 'lucide-react';
import { ProjectFormData } from '@/lib/validations/priority2Schemas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectsTabNewProps {
  employeeId: string;
}

export const ProjectsTabNew = ({ employeeId }: ProjectsTabNewProps) => {
  const { projects, allProjects, createProject, updateProject, deleteProject } = useProjects(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeProjects = allProjects.filter(p => p.status === 'active').length;
  const completedProjects = allProjects.filter(p => p.status === 'completed').length;
  const avgProgress = allProjects.length > 0 
    ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length) 
    : 0;
  const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget_total || 0), 0);

  const filteredProjects = statusFilter === 'all' 
    ? allProjects 
    : allProjects.filter(p => p.status === statusFilter);

  const handleCreateProject = async (data: ProjectFormData) => {
    await createProject({
      project_name: data.project_name!,
      description: data.description,
      status: data.status!,
      priority: data.priority!,
      start_date: data.start_date,
      end_date: data.end_date,
      deadline: data.deadline,
      budget_total: data.budget_total,
      department: data.department,
      client_name: data.client_name,
      created_by: employeeId,
    });
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    await updateProject({
      projectId: selectedProject.id,
      updates: data,
    });
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    await deleteProject(projectToDelete);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const openEditDialog = (project: any) => {
    setSelectedProject(project);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedProject(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      planning: { label: 'Planung', className: 'bg-blue-100 text-blue-800' },
      active: { label: 'Aktiv', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Abgeschlossen', className: 'bg-gray-100 text-gray-800' },
      on_hold: { label: 'Pausiert', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Abgebrochen', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.planning;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      low: { label: 'Niedrig', className: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Mittel', className: 'bg-blue-100 text-blue-800' },
      high: { label: 'Hoch', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Kritisch', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[priority] || variants.medium;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Projekte</p>
              <p className="text-2xl font-bold">{activeProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abgeschlossen</p>
              <p className="text-2xl font-bold">{completedProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Fortschritt</p>
              <p className="text-2xl font-bold">{avgProgress}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt-Budget</p>
              <p className="text-2xl font-bold">{totalBudget.toLocaleString('de-DE')}€</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Actions */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="planning">Planung</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="on_hold">Pausiert</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Projekt
        </Button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Keine Projekte gefunden.</p>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{project.project_name}</h3>
                    {getStatusBadge(project.status)}
                    {getPriorityBadge(project.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setProjectToDelete(project.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {project.budget_total && (
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{project.budget_total.toLocaleString('de-DE')}€</p>
                    </div>
                  )}
                  {project.deadline && (
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">
                        {new Date(project.deadline).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  )}
                  {project.department && (
                    <div>
                      <p className="text-muted-foreground">Abteilung</p>
                      <p className="font-medium">{project.department}</p>
                    </div>
                  )}
                  {project.client_name && (
                    <div>
                      <p className="text-muted-foreground">Kunde</p>
                      <p className="font-medium">{project.client_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreateProject : handleUpdateProject}
        project={selectedProject}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
