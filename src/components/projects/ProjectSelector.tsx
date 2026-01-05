
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ProjectSelectorProps {
  projectId: string;
  onProjectChange: (projectId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ProjectSelector = ({
  projectId,
  onProjectChange,
  placeholder = "Projekt auswählen",
  disabled = false
}: ProjectSelectorProps) => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .order('name');
        
      if (error) {
        console.error('Fehler beim Laden der Projekte:', error);
        throw error;
      }
      
      // Filter out projects with invalid IDs and ensure all have valid data
      const validProjects = (data || []).filter(project => {
        const isValid = project.id && 
          typeof project.id === 'string' &&
          project.id.trim() !== '';
        
        if (!isValid) {
          console.warn('Filtering out project with invalid ID in ProjectSelector:', project);
        }
        
        return isValid;
      });
      
      console.log('Valid projects loaded for ProjectSelector:', validProjects);
      return validProjects;
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Projekte werden geladen...</span>
      </div>
    );
  }
  
  // Ensure we have a valid value - if projectId is empty string or falsy, use "none"
  const safeProjectId = projectId && projectId.trim() !== '' ? projectId : "none";
  
  console.log('ProjectSelector - projectId:', projectId, 'safeProjectId:', safeProjectId);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Projekt</label>
      <Select 
        value={safeProjectId} 
        onValueChange={onProjectChange}
        disabled={disabled || !projects?.length}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Kein Projekt</SelectItem>
          {projects?.map(project => {
            // Ensure each project has a valid, non-empty ID
            const projectValue = project.id;
            const projectName = project.name || 'Unbekanntes Projekt';
            
            // Only render projects with valid IDs - triple check to prevent empty strings
            if (!projectValue || typeof projectValue !== 'string' || projectValue.trim() === '') {
              console.warn('Skipping project with invalid ID in ProjectSelector render:', project);
              return null;
            }
            
            // Final safety check - ensure projectValue is not just whitespace
            const cleanProjectValue = projectValue.trim();
            if (cleanProjectValue === '') {
              console.warn('Skipping project with empty ID after trim in ProjectSelector render:', project);
              return null;
            }
            
            return (
              <SelectItem 
                key={cleanProjectValue} 
                value={cleanProjectValue}
              >
                {projectName}
                {(project.status === 'completed' || project.status === 'archived') && 
                  <span className="ml-2 text-xs text-muted-foreground">({project.status})</span>
                }
              </SelectItem>
            );
          }).filter(Boolean)}
          
          {projects?.length === 0 && (
            <SelectItem value="no-projects-found" disabled>
              Keine Projekte gefunden
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectSelector;
