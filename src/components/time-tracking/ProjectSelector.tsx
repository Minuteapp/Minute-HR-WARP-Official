
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";

interface ProjectSelectorProps {
  project: string;
  onProjectChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  allowNone?: boolean;
}

const ProjectSelector = ({ 
  project, 
  onProjectChange,
  label = "Projekt",
  placeholder = "Projekt auswählen",
  allowNone = true
}: ProjectSelectorProps) => {
  const { user } = useAuth();
  const { isEmployee } = useEnterprisePermissions();
  
  const { data: projects, error, isLoading } = useQuery({
    queryKey: ['projects-selector', user?.id, isEmployee],
    queryFn: async () => {
      console.log('Fetching projects for user:', user?.id, 'isEmployee:', isEmployee);
      
      if (!user?.id) {
        return [];
      }

      // Projekte abrufen - alle Projekte anzeigen, nicht nur aktive
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['active', 'pending', 'planning'])
        .order('name');
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      // Filter für Mitarbeiter: Nur zugewiesene Projekte
      let filteredData = data || [];
      if (isEmployee) {
        filteredData = filteredData.filter(project => {
          const isOwner = project.owner_id === user.id;
          const isTeamMember = Array.isArray(project.team_members) && 
            project.team_members.includes(user.id);
          return isOwner || isTeamMember;
        });
        console.log('Filtered projects for employee:', filteredData.length);
      }
      
      // Filter out projects with invalid IDs and ensure all have valid data
      const validProjects = filteredData.filter(project => {
        const isValid = project.id && 
          typeof project.id === 'string' &&
          project.id.trim() !== '';
        
        if (!isValid) {
          console.warn('Filtering out project with invalid ID in ProjectSelector:', project);
        }
        
        return isValid;
      });
      
      console.log('Fetched valid projects for user:', validProjects);
      return validProjects;
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  if (error) {
    console.error('ProjectSelector Query Error:', error);
  }

  // Ensure we have a valid value - if project is empty string or falsy, use "none"
  const safeProject = project && project.trim() !== '' ? project : (allowNone ? "none" : "");

  console.log('ProjectSelector - project:', project, 'safeProject:', safeProject);

  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={safeProject} onValueChange={onProjectChange}>
        <SelectTrigger className="border-[#3B44F6] outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 ring-offset-0 shadow-card">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-[#3B44F6] bg-white z-50">
          {allowNone && (
            <SelectItem 
              value="none" 
              className="outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 ring-offset-0"
            >
              Kein Projekt
            </SelectItem>
          )}
          
          {isLoading && (
            <SelectItem 
              value="loading-state" 
              disabled
              className="outline-none focus:outline-none"
            >
              Projekte werden geladen...
            </SelectItem>
          )}
          
          {projects?.map((project) => {
            const projectValue = project.id;
            const projectName = project.name || 'Unbekanntes Projekt';
            
            if (!projectValue || typeof projectValue !== 'string' || projectValue.trim() === '') {
              console.warn('Skipping project with invalid ID in ProjectSelector render:', project);
              return null;
            }
            
            const cleanProjectValue = projectValue.trim();
            if (cleanProjectValue === '') {
              console.warn('Skipping project with empty ID after trim in ProjectSelector render:', project);
              return null;
            }
            
            return (
              <SelectItem 
                key={cleanProjectValue} 
                value={cleanProjectValue} 
                className="outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 ring-offset-0"
              >
                {projectName}
              </SelectItem>
            );
          }).filter(Boolean)}
          
          {projects?.length === 0 && !isLoading && (
            <SelectItem 
              value="no-projects-available" 
              disabled
              className="outline-none focus:outline-none"
            >
              Keine Projekte gefunden
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;
