import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Briefcase, Users, Calendar, CheckSquare, Award, Shield, FileText, Archive } from 'lucide-react';
import { usePermissionContext } from '@/contexts/PermissionContext';
import EnterpriseRecruitingHeader from './EnterpriseRecruitingHeader';
import ExecutiveOverviewTab from './tabs/ExecutiveOverviewTab';
import JobsApprovalTab from './tabs/JobsApprovalTab';
import ApplicationsTab from './tabs/ApplicationsTab';
import InterviewsTab from './tabs/InterviewsTab';
import DecisionsTab from './tabs/DecisionsTab';
import TalentPoolTab from './tabs/TalentPoolTab';
import ComplianceTab from './tabs/ComplianceTab';
import ReportsTab from './tabs/ReportsTab';
import ArchiveTab from './tabs/ArchiveTab';

const EnterpriseRecruitingDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const { hasPermission } = usePermissionContext();

  const resetFilters = () => {
    setSelectedCountry('all');
    setSelectedLocation('all');
    setSelectedDepartment('all');
  };

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'overview', label: 'Übersicht', icon: BarChart3, requiredAction: 'view' },
    { id: 'jobs', label: 'Stellen', icon: Briefcase, requiredAction: 'view' },
    { id: 'applications', label: 'Bewerbungen', icon: Users, requiredAction: 'view' },
    { id: 'interviews', label: 'Interviews', icon: Calendar, requiredAction: 'view' },
    { id: 'reports', label: 'Reports & Archiv', icon: FileText, requiredAction: 'export' },
  ];

  const tabs = useMemo(() => {
    return allTabs.filter(tab => hasPermission('recruiting', tab.requiredAction));
  }, [hasPermission]);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <EnterpriseRecruitingHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex items-center gap-6 border-b bg-transparent h-auto p-0 overflow-x-auto w-full justify-start rounded-none">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ExecutiveOverviewTab
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              onResetFilters={resetFilters}
            />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <JobsApprovalTab />
          </TabsContent>

          <TabsContent value="applications" className="mt-6">
            <ApplicationsTab />
          </TabsContent>

          <TabsContent value="interviews" className="mt-6">
            <InterviewsTab />
          </TabsContent>

          <TabsContent value="decisions" className="mt-6">
            <DecisionsTab />
          </TabsContent>

          <TabsContent value="talentpool" className="mt-6">
            <TalentPoolTab />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="archive" className="mt-6">
            <ArchiveTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnterpriseRecruitingDashboard;
