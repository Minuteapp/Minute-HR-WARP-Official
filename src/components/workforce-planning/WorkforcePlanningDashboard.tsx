
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TrendingUp, Calendar, AlertCircle, Building2, Target, BarChart3, Settings, Users2, ClipboardList, Shield, Lightbulb } from "lucide-react";
import { useWorkforceData } from "@/hooks/useWorkforceData";
import { useWorkforceExtended } from "@/hooks/useWorkforceExtended";
import { WorkforceChart } from "./WorkforceChart";
import { DepartmentTable } from "./DepartmentTable";
import { WorkforceOverview } from "./tabs/WorkforceOverview";
import { CapacityDemand } from "./tabs/CapacityDemand";
import { SkillsCertifications } from "./tabs/SkillsCertifications";
import { ScenarioPlanner } from "./tabs/ScenarioPlanner";
import { WorkforceAssignments } from "./tabs/WorkforceAssignments";
import { ComplianceReport } from "./tabs/ComplianceReport";
import { RequestsCenter } from "./tabs/RequestsCenter";
import { WorkforceSettings } from "./tabs/WorkforceSettings";

import { WorkforceMobileDashboard } from "./WorkforceMobileDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";

export const WorkforcePlanningDashboard = () => {
  const { stats, analytics, departments, isLoading } = useWorkforceData();
  const { dashboardKPIs, isLoading: extendedLoading } = useWorkforceExtended();
  const { userRoles } = useAuth();
  const { isMobile } = useResponsive();

  // Determine user role for mobile dashboard
  const getUserRole = (): 'planner' | 'manager' | 'employee' => {
    const roles = userRoles?.map(r => r.role) || [];
    if (roles.includes('admin') || roles.includes('hr')) return 'planner';
    if (roles.includes('manager')) return 'manager';
    return 'employee';
  };

  if (isLoading || extendedLoading) {
    return <div className="animate-pulse">Loading Workforce Planning...</div>;
  }

  // Mobile view with responsive detection
  if (isMobile) {
    return <WorkforceMobileDashboard userRole={getUserRole()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Workforce Planning</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="capacity">Kapazität</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="scenarios">Szenarien</TabsTrigger>
          <TabsTrigger value="assignments">Zuweisungen</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkforceOverview />
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <CapacityDemand />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsCertifications />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <ScenarioPlanner />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <WorkforceAssignments />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceReport />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <RequestsCenter />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <WorkforceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
