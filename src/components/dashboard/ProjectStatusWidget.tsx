
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

const ProjectStatusWidget = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useTenant();
  
  // Lade alle Projekte (gleiche Abfrage wie im Projekte-Modul)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['all-projects-dashboard', isSuperAdmin],
    queryFn: async () => {
      // Superadmin ohne Tenant-Kontext: keine tenant-spezifischen Daten anzeigen
      if (isSuperAdmin) return [];

      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const handleCardClick = () => {
    navigate('/projects');
  };

  if (isLoading) return <Card className="p-4 cursor-pointer" onClick={handleCardClick}>Lädt...</Card>;

  // Korrekte Statistiken berechnen basierend auf allen Projekten
  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const pendingProjects = projects?.filter(p => p.status === 'pending' || p.status === 'planned') || [];
  
  // Verzögerte Projekte: Aktive Projekte mit niedrigem Fortschritt oder überfällige Projekte
  const delayedProjects = projects?.filter(p => {
    if (p.status !== 'active') return false;
    
    // Projekte mit Fortschritt unter 30% nach der Hälfte der geplanten Zeit
    if (p.progress < 30) return true;
    
    // Projekte, die ihr Enddatum überschritten haben
    if (p.end_date && new Date(p.end_date) < new Date() && p.progress < 100) return true;
    
    return false;
  }) || [];

  const totalProjects = projects?.length || 0;

  return (
    <Card className="p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-semibold">Projekt Status</h2>
          <p className="text-blue-600 text-sm font-medium">
            {totalProjects} Projekte gesamt
          </p>
        </div>
        <Briefcase className="h-5 w-5 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#E8F5E8] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mb-1" />
            <span className="text-xl font-bold">{activeProjects.length}</span>
            <span className="text-xs text-gray-600">Aktiv</span>
          </div>
        </div>
        
        <div className="bg-[#E3F2FD] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <Clock className="h-4 w-4 text-blue-600 mb-1" />
            <span className="text-xl font-bold">{pendingProjects.length}</span>
            <span className="text-xs text-gray-600">Geplant</span>
          </div>
        </div>
        
        <div className="bg-[#F3E5F5] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <Briefcase className="h-4 w-4 text-purple-600 mb-1" />
            <span className="text-xl font-bold">{completedProjects.length}</span>
            <span className="text-xs text-gray-600">Abgeschlossen</span>
          </div>
        </div>
        
        <div className="bg-[#FFF3E0] rounded-lg p-2 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-4 w-4 text-orange-600 mb-1" />
            <span className="text-xl font-bold">{delayedProjects.length}</span>
            <span className="text-xs text-gray-600">Verzögert</span>
          </div>
        </div>
      </div>

      {/* Aktuelle Projekte anzeigen */}
      <div className="space-y-2">
        {projects && projects.slice(0, 3).map((project) => (
          <div key={project.id} className="border-l-4 border-blue-500 pl-3 py-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium truncate">{project.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                project.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status === 'active' ? 'Aktiv' : 
                 project.status === 'completed' ? 'Abgeschlossen' : 
                 project.status === 'pending' ? 'Geplant' : project.status}
              </span>
            </div>
            <div className="mt-1">
              <div className="flex items-center gap-2">
                <Progress value={project.progress} className="h-1.5 flex-grow" />
                <span className="text-xs text-gray-500">{project.progress}%</span>
              </div>
            </div>
          </div>
        ))}
        
        {(!projects || projects.length === 0) && (
          <div className="text-center text-sm text-gray-500 py-2">
            Keine Projekte gefunden
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectStatusWidget;
