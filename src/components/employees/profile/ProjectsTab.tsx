
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Plus, Calendar, Users, Target } from "lucide-react";
import { ProjectAssignment } from "@/types/employee.types";

interface ProjectsTabProps {
  employeeId: string;
  projectAssignments: ProjectAssignment[];
}

export const ProjectsTab = ({ employeeId, projectAssignments }: ProjectsTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      case 'on_hold': return 'Pausiert';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return 'Projektleiter';
      case 'member': return 'Mitglied';
      case 'lead': return 'Lead';
      case 'contributor': return 'Mitwirkender';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projekte</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Projekt zuweisen
        </Button>
      </div>

      {/* Projekt-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktive Projekte</p>
                <p className="text-2xl font-bold">
                  {projectAssignments.filter(p => p.projects.status === 'active').length}
                </p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold text-green-600">
                  {projectAssignments.filter(p => p.projects.status === 'completed').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leitungsrollen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {projectAssignments.filter(p => p.role === 'manager' || p.role === 'lead').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projekte Liste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Zugewiesene Projekte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Projekte zugewiesen</p>
          ) : (
            <div className="space-y-4">
              {projectAssignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{assignment.projects.name}</h3>
                      {assignment.projects.description && (
                        <p className="text-sm text-gray-600 mt-1">{assignment.projects.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getRoleLabel(assignment.role)}</Badge>
                      <Badge className={getStatusColor(assignment.projects.status)}>
                        {getStatusLabel(assignment.projects.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Fortschritt</span>
                      <span>{assignment.projects.progress}%</span>
                    </div>
                    <Progress value={assignment.projects.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {assignment.projects.start_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Start: {new Date(assignment.projects.start_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                    {assignment.projects.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Ende: {new Date(assignment.projects.end_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
