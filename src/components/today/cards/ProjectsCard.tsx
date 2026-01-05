
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const ProjectsCard = ({ darkMode, onToggleVisibility }: ProjectsCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Echte Projekte aus der Datenbank laden
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, progress, end_date')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      return data || [];
    },
    enabled: !!user
  });
  
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <Card className={`today-card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Briefcase className="h-5 w-5 text-primary" />
          Projekte
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/projects')}>
              Zu Projekten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6 text-gray-500">
              Lade Projekte...
            </div>
          ) : projects.length > 0 ? (
            projects.map((project) => {
              const getStatusBadge = () => {
                if (project.status === 'active') return { text: 'In Bearbeitung', class: 'bg-blue-100 text-blue-800' };
                if (project.status === 'completed') return { text: 'Abgeschlossen', class: 'bg-green-100 text-green-800' };
                if (project.status === 'at_risk') return { text: 'Gefährdet', class: 'bg-red-100 text-red-800' };
                return { text: 'Geplant', class: 'bg-gray-100 text-gray-800' };
              };
              
              const badge = getStatusBadge();
              const endDate = project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : '';
              
              return (
                <div
                  key={project.id}
                  className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <span className="text-sm font-medium text-primary">
                      {project.progress}%
                    </span>
                  </div>
                  
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />
                  
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      Fällig: {endDate || 'Nicht festgelegt'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-500">
              Keine aktiven Projekte
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/projects')}
        >
          Alle Projekte anzeigen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectsCard;
