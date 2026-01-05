
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  MessageSquare, 
  GraduationCap, 
  Car, 
  UserCheck, 
  BookOpen, 
  TestTube, 
  ShoppingCart, 
  BarChart3, 
  Shield,
  FileText
} from "lucide-react";
import { OrganizationalStructure } from "@/components/hr/organizational/OrganizationalStructure";
import { AuditRevision } from "@/components/hr/audit/AuditRevision";
import { EmployeeSurveys } from "@/components/hr/surveys/EmployeeSurveys";
import { MiniLMS } from "@/components/hr/lms/MiniLMS";
import { FleetManagement } from "@/components/hr/fleet/FleetManagement";
import { DynamicRoleSystem } from "@/components/hr/roles/DynamicRoleSystem";
import { ComplianceTraining } from "@/components/hr/compliance/ComplianceTraining";
import { SandboxModule } from "@/components/hr/sandbox/SandboxModule";
import { InternalMarketplace } from "@/components/hr/marketplace/InternalMarketplace";
import { ExecutiveDashboard } from "@/components/hr/executive/ExecutiveDashboard";
import { SecurityEnhancements } from "@/components/hr/security/SecurityEnhancements";
import { TemplateSystem } from "@/components/hr/templates/TemplateSystem";

const HRPage = () => {
  const { isSuperAdmin, isAdmin } = useRolePermissions();

  // Nur SuperAdmins und Admins haben Zugriff auf die HR-Suite
  if (!isSuperAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Suite</h1>
              <p className="text-gray-600 mt-1">Umfassendes Personalmanagement-System</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-xs">
            {isSuperAdmin ? 'SuperAdmin' : 'Admin'}
          </Badge>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl text-gray-900">HR Management Module</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="structure" className="w-full">
              <div className="px-6 pt-6">
                <TabsList className="w-full grid grid-cols-6 lg:grid-cols-12 gap-1 h-auto p-1 bg-gray-100/50 rounded-lg">
                  <TabsTrigger value="structure" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <Building2 className="h-3 w-3 mr-1" />
                    Struktur
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    Audit
                  </TabsTrigger>
                  <TabsTrigger value="surveys" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Umfragen
                  </TabsTrigger>
                  <TabsTrigger value="lms" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    LMS
                  </TabsTrigger>
                  <TabsTrigger value="fleet" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <Car className="h-3 w-3 mr-1" />
                    Fuhrpark
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Rollen
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Compliance
                  </TabsTrigger>
                  <TabsTrigger value="sandbox" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <TestTube className="h-3 w-3 mr-1" />
                    Sandbox
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Marktplatz
                  </TabsTrigger>
                  <TabsTrigger value="executive" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Executive
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Sicherheit
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="rounded-md data-[state=active]:bg-white text-xs p-2">
                    <FileText className="h-3 w-3 mr-1" />
                    Vorlagen
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="structure" className="px-6 pb-6 pt-4">
                <OrganizationalStructure />
              </TabsContent>
              <TabsContent value="audit" className="px-6 pb-6 pt-4">
                <AuditRevision />
              </TabsContent>
              <TabsContent value="surveys" className="px-6 pb-6 pt-4">
                <EmployeeSurveys />
              </TabsContent>
              <TabsContent value="lms" className="px-6 pb-6 pt-4">
                <MiniLMS />
              </TabsContent>
              <TabsContent value="fleet" className="px-6 pb-6 pt-4">
                <FleetManagement />
              </TabsContent>
              <TabsContent value="roles" className="px-6 pb-6 pt-4">
                <DynamicRoleSystem />
              </TabsContent>
              <TabsContent value="compliance" className="px-6 pb-6 pt-4">
                <ComplianceTraining />
              </TabsContent>
              <TabsContent value="sandbox" className="px-6 pb-6 pt-4">
                <SandboxModule />
              </TabsContent>
              <TabsContent value="marketplace" className="px-6 pb-6 pt-4">
                <InternalMarketplace />
              </TabsContent>
              <TabsContent value="executive" className="px-6 pb-6 pt-4">
                <ExecutiveDashboard />
              </TabsContent>
              <TabsContent value="security" className="px-6 pb-6 pt-4">
                <SecurityEnhancements />
              </TabsContent>
              <TabsContent value="templates" className="px-6 pb-6 pt-4">
                <TemplateSystem />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRPage;
