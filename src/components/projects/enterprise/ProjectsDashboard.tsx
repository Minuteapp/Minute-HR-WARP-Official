import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  List, 
  Calendar, 
  CheckSquare, 
  Users, 
  DollarSign, 
  GitBranch, 
  MessageSquare, 
  BarChart3, 
  Archive,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import OverviewTab from './tabs/OverviewTab';
import ProjectListTab from './tabs/ProjectListTab';
import PlanningTab from './tabs/PlanningTab';
import TasksTab from './tabs/TasksTab';
import ResourcesTab from './tabs/ResourcesTab';
import BudgetTab from './tabs/BudgetTab';
import DependenciesTab from './tabs/DependenciesTab';
import CommunicationTab from './tabs/CommunicationTab';
import ReportsTab from './tabs/ReportsTab';
import ProjectArchiveTab from './tabs/ProjectArchiveTab';
import ProjectSettingsTab from './tabs/ProjectSettingsTab';

const allTabs = [
  { id: 'overview', label: 'Übersicht', icon: LayoutGrid, preview: true, requiredAction: 'view', employeeVisible: true },
  { id: 'projects', label: 'Projektliste', icon: List, requiredAction: 'view', employeeVisible: true },
  { id: 'planning', label: 'Planung', icon: Calendar, requiredAction: 'view', employeeVisible: true },
  { id: 'tasks', label: 'Aufgaben', icon: CheckSquare, requiredAction: 'view', employeeVisible: true },
  { id: 'resources', label: 'Ressourcen', icon: Users, requiredAction: 'view', employeeVisible: false },
  { id: 'budget', label: 'Budget', icon: DollarSign, requiredAction: 'view', scope: 'budget', employeeVisible: false },
  { id: 'dependencies', label: 'Abhängigkeiten', icon: GitBranch, requiredAction: 'view', employeeVisible: false },
  { id: 'communication', label: 'Kommunikation', icon: MessageSquare, requiredAction: 'view', employeeVisible: true },
  { id: 'reports', label: 'Reports', icon: BarChart3, requiredAction: 'export', employeeVisible: false },
  { id: 'archive', label: 'Archiv', icon: Archive, requiredAction: 'view', employeeVisible: false },
  { id: 'settings', label: 'Einstellungen', icon: Settings, requiredAction: 'update', adminOnly: true, employeeVisible: false },
];

const ProjectsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { hasPermission } = usePermissionContext();
  const { isEmployee } = useEnterprisePermissions();

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('projects', 'update');
    return allTabs.filter(tab => {
      // Mitarbeiter: Nur bestimmte Tabs sichtbar
      if (isEmployee && !tab.employeeVisible) return false;
      if (tab.adminOnly && !canAdmin) return false;
      if (tab.scope && !hasPermission('projects', tab.requiredAction, tab.scope)) return false;
      return hasPermission('projects', tab.requiredAction);
    });
  }, [hasPermission, isEmployee]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Projekte</h1>
              <p className="text-sm text-muted-foreground">Projektverwaltung und Ressourcenplanung</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-center gap-6 border-b bg-transparent h-auto p-0 overflow-x-auto w-full justify-start rounded-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-6">
          <ProjectListTab />
        </TabsContent>
        
        <TabsContent value="planning" className="mt-6">
          <PlanningTab />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TasksTab />
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <ResourcesTab />
        </TabsContent>
        
        <TabsContent value="budget" className="mt-6">
          <BudgetTab />
        </TabsContent>
        
        <TabsContent value="dependencies" className="mt-6">
          <DependenciesTab />
        </TabsContent>
        
        <TabsContent value="communication" className="mt-6">
          <CommunicationTab />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>
        
        <TabsContent value="archive" className="mt-6">
          <ProjectArchiveTab />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <ProjectSettingsTab />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectsDashboard;
