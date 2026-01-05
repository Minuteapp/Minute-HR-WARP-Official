
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Users, 
  BarChart3, 
  Calendar,
  Settings,
  CheckCircle,
  Building,
  CreditCard
} from 'lucide-react';
import { ProjectTimeTracking } from './ProjectTimeTracking';
import { ProjectExpenses } from './ProjectExpenses';
import { ProjectTeamManagement } from './ProjectTeamManagement';
import { ProjectReports } from './ProjectReports';
import { ProjectAbsenceManagement } from './ProjectAbsenceManagement';
import { PayrollTimeTracking } from './PayrollTimeTracking';
import { PayrollPerformance } from './PayrollPerformance';
import { PayrollExpenses } from './PayrollExpenses';

interface ProjectModuleIntegrationsProps {
  projectId: string;
  projectName: string;
}

export const ProjectModuleIntegrations: React.FC<ProjectModuleIntegrationsProps> = ({
  projectId,
  projectName
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const modules = [
    {
      id: 'timetracking',
      name: 'Zeiterfassung',
      icon: <Clock className="h-5 w-5" />,
      status: 'active',
      description: 'Arbeitszeit-Tracking für Projektmitarbeiter'
    },
    {
      id: 'expenses',
      name: 'Ausgaben',
      icon: <DollarSign className="h-5 w-5" />,
      status: 'inactive',
      description: 'Spesenverwaltung und Kostenkontrolle'
    },
    {
      id: 'team',
      name: 'Personal',
      icon: <Users className="h-5 w-5" />,
      status: 'active',
      description: 'Teammitglieder und Ressourcenplanung'
    },
    {
      id: 'reports',
      name: 'Berichte',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'active',
      description: 'Projektauswertungen und Analysen'
    },
    {
      id: 'absence',
      name: 'Abwesenheit/Urlaub',
      icon: <Calendar className="h-5 w-5" />,
      status: 'inactive',
      description: 'Urlaubsplanung und Abwesenheitsverwaltung'
    },
    {
      id: 'payroll',
      name: 'Lohn & Gehalt',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'active',
      description: 'Gehaltsabrechnung und Bonusberechnung'
    }
  ];

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
      : <Badge variant="outline">Inaktiv</Badge>;
  };

  const activeModules = modules.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="timetracking" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Zeiterfassung
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Ausgaben
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Berichte
          </TabsTrigger>
          <TabsTrigger value="absence" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Abwesenheit
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Lohn & Gehalt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aktive Module</p>
                    <p className="text-2xl font-bold">{activeModules}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verfügbare Module</p>
                    <p className="text-2xl font-bold">{modules.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Projekt</p>
                    <p className="text-lg font-medium truncate">{projectName}</p>
                  </div>
                  <Building className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {module.icon}
                      <div>
                        <h3 className="font-medium">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    {getStatusBadge(module.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetracking">
          <ProjectTimeTracking projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="expenses">
          <ProjectExpenses projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="team">
          <ProjectTeamManagement projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="reports">
          <ProjectReports projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="absence">
          <ProjectAbsenceManagement projectId={projectId} projectName={projectName} />
        </TabsContent>

        <TabsContent value="payroll">
          <Tabs defaultValue="time-salary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="time-salary">Zeiterfassung → Gehalt</TabsTrigger>
              <TabsTrigger value="performance-bonus">Performance → Bonus</TabsTrigger>
              <TabsTrigger value="expenses-payroll">Spesen → Abrechnung</TabsTrigger>
            </TabsList>
            
            <TabsContent value="time-salary">
              <PayrollTimeTracking projectId={projectId} projectName={projectName} />
            </TabsContent>
            
            <TabsContent value="performance-bonus">
              <PayrollPerformance projectId={projectId} projectName={projectName} />
            </TabsContent>
            
            <TabsContent value="expenses-payroll">
              <PayrollExpenses projectId={projectId} projectName={projectName} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};
