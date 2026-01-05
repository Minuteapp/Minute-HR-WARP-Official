
import { AreaChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { useTenant } from '@/contexts/TenantContext';

// Definiere ein einfaches Interface für die Projektdaten, die wir vom Backend erhalten
interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  end_date?: string;
}

const ProjectWidget = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, tenantCompany } = useTenant();

  const { data: projects = [], isLoading } = useQuery<ProjectData[]>({
    queryKey: ['dashboard-projects-summary', tenantCompany?.id],
    queryFn: async () => {
      if (!tenantCompany?.id) return [];

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', tenantCompany.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      return data || [];
    },
    enabled: !!tenantCompany?.id
  });

  // Statistik berechnen
  const stats = {
    onTrack: projects.filter(p => p.status === 'active' && p.progress >= 40).length,
    delayed: projects.filter(p => p.status === 'active' && p.progress < 40).length,
    critical: projects.filter(p => p.status === 'pending' && p.progress < 20).length
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'active': return 'Im Plan';
      case 'delayed': return 'Verzögert';
      case 'pending': return 'Ausstehend';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const handleWidgetClick = () => {
    navigate('/projects');
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleWidgetClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">Projekte</h2>
        <AreaChart size={20} className="text-primary" />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-50 rounded p-2">
          <span className="text-xl font-bold text-green-600 block text-center">{stats.onTrack}</span>
          <p className="text-xs text-gray-600 text-center">Im Plan</p>
        </div>
        
        <div className="bg-amber-50 rounded p-2">
          <span className="text-xl font-bold text-amber-600 block text-center">{stats.delayed}</span>
          <p className="text-xs text-gray-600 text-center">Verzögert</p>
        </div>
        
        <div className="bg-red-50 rounded p-2">
          <span className="text-xl font-bold text-red-600 block text-center">{stats.critical}</span>
          <p className="text-xs text-gray-600 text-center">Kritisch</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-sm text-gray-500">Lade Projekte...</div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{project.name}</p>
                <span className={`text-xs ${
                  project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  project.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'
                } px-2 py-0.5 rounded-full`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fortschritt</p>
                <div className="mt-1 flex items-center gap-1">
                  <Progress value={project.progress} className="h-1.5 flex-grow" />
                  <p className="text-xs text-gray-500">{project.progress}%</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500">Keine Projekte gefunden</div>
        )}
      </div>
    </div>
  );
};

export default ProjectWidget;
