import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { useProjects } from '@/hooks/projects/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import EnterpriseKPIGrid from '../overview/EnterpriseKPIGrid';
import EnterpriseAISummary from '../overview/EnterpriseAISummary';
import EnterpriseHeatmap from '../overview/EnterpriseHeatmap';
import EnterpriseBudgetVsProgress from '../overview/EnterpriseBudgetVsProgress';
import EnterpriseStatusPieChart from '../overview/EnterpriseStatusPieChart';
import EnterpriseTopCritical from '../overview/EnterpriseTopCritical';
import EnterpriseAIRecommendations from '../overview/EnterpriseAIRecommendations';

// Mitarbeiter-Übersicht: Nur eigene Projekte
const EmployeeOverviewView = () => {
  const { projects: rawProjects, isLoading } = useProjects();
  const { user } = useAuth();
  
  // Filtere nur zugewiesene Projekte
  const myProjects = rawProjects.filter(project => {
    const isOwner = project.owner_id === user?.id;
    const isTeamMember = Array.isArray(project.team_members) && 
      project.team_members.includes(user?.id);
    return isOwner || isTeamMember;
  });
  
  const projectCount = myProjects.length;
  // TODO: Aufgaben aus tasks Tabelle laden wenn implementiert
  const openTasks = 0;
  const completedTasks = 0;
  const overdueTasks = 0;
  
  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Wird geladen...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Persönliche Projekt-Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meine Projekte</p>
                <p className="text-2xl font-bold">{projectCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offene Aufgaben</p>
                <p className="text-2xl font-bold">{openTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Erledigte Aufgaben</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Überfällig</p>
                <p className="text-2xl font-bold">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hinweis nur wenn keine Projekte */}
      {projectCount === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Keine Projekte zugewiesen</p>
            <p className="text-sm mt-1">Sobald Sie einem Projekt zugewiesen werden, sehen Sie hier Ihre Projektübersicht</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Admin-Übersicht: Alle Projekte
const AdminOverviewView = () => {
  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <EnterpriseAISummary />
      
      {/* KPI Cards - 2 Rows */}
      <EnterpriseKPIGrid />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseHeatmap />
        <EnterpriseBudgetVsProgress />
      </div>
      
      {/* Status + Top Critical Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnterpriseStatusPieChart />
        <EnterpriseTopCritical />
      </div>
      
      {/* AI Recommendations */}
      <EnterpriseAIRecommendations />
    </div>
  );
};

const OverviewTab = () => {
  const { isEmployee } = useEnterprisePermissions();
  
  if (isEmployee) {
    return <EmployeeOverviewView />;
  }
  
  return <AdminOverviewView />;
};

export default OverviewTab;
