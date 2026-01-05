
import { TabsContent } from "@/components/ui/tabs";
import { ProjectsTab } from "../profile/ProjectsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectAssignment } from "@/types/employee.types";

export const ProjectsTabContent = ({ employeeId }: { employeeId: string }) => {
  const { data: projectAssignments, isLoading } = useQuery({
    queryKey: ['projectAssignments', employeeId],
    queryFn: async () => {
      try {
        console.log('Suche nach Projektzuweisungen für Mitarbeiter:', employeeId);
        
        // Projekt-Zuweisungen über project_assignments abfragen
        const { data: assignments, error: assignmentError } = await supabase
          .from('project_assignments')
          .select(`
            id,
            role,
            project_id,
            projects:project_id (
              id,
              name,
              description,
              start_date,
              end_date,
              status,
              progress
            )
          `)
          .eq('user_id', employeeId);
          
        if (assignmentError) {
          console.error('Fehler beim Laden der Projekt-Zuweisungen:', assignmentError);
          throw assignmentError;
        }
        
        // Zusätzlich Projekte abrufen, bei denen der Mitarbeiter im team_members-Array steht
        const { data: teamProjects, error: teamProjectsError } = await supabase
          .from('projects')
          .select('*')
          .contains('team_members', [employeeId]);
          
        if (teamProjectsError) {
          console.error('Fehler beim Laden der Team-Projekte:', teamProjectsError);
          throw teamProjectsError;
        }
        
        // Ergebnisse transformieren und zusammenführen
        const assignmentResults: ProjectAssignment[] = assignments?.map((assignment: any) => ({
          id: assignment.id,
          role: assignment.role,
          project_id: assignment.project_id,
          projects: {
            id: assignment.projects?.id || '',
            name: assignment.projects?.name || '',
            status: assignment.projects?.status || '',
            progress: assignment.projects?.progress || 0,
            description: assignment.projects?.description,
            start_date: assignment.projects?.start_date,
            end_date: assignment.projects?.end_date
          }
        })) || [];
        
        // Teammitglieder-Projekte in das gleiche Format bringen
        const teamProjectResults: ProjectAssignment[] = teamProjects?.map((project: any) => ({
          id: `team-${project.id}`, // Eindeutige ID
          role: 'member', // Standard-Rolle für Teammitglieder
          project_id: project.id,
          projects: {
            id: project.id,
            name: project.name || '',
            status: project.status || '',
            progress: project.progress || 0,
            description: project.description,
            start_date: project.start_date,
            end_date: project.end_date
          }
        })) || [];
        
        // Projekte deduplizieren (falls ein Projekt sowohl durch assignment als auch team_members gefunden wird)
        const uniqueProjects = [...assignmentResults];
        
        teamProjectResults.forEach(teamProject => {
          // Prüfen, ob das Projekt nicht bereits in den Ergebnissen vorhanden ist
          if (!uniqueProjects.some(p => p.project_id === teamProject.project_id)) {
            uniqueProjects.push(teamProject);
          }
        });
        
        console.log('Gefundene Projekte für Mitarbeiter:', uniqueProjects);
        return uniqueProjects;
      } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        return [];
      }
    }
  });

  return (
    <TabsContent value="projects" className="bg-white p-6 rounded-lg border shadow-sm">
      <ProjectsTab 
        employeeId={employeeId}
        projectAssignments={projectAssignments || []}
      />
    </TabsContent>
  );
};
