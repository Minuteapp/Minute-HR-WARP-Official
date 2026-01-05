import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Shield, GitBranch, Crown, Lock, Brain, 
  FileText, Eye, Settings, LayoutGrid
} from 'lucide-react';
import { UsersTab } from './tabs/UsersTab';
import { RolesTemplatesTab } from './tabs/RolesTemplatesTab';
import { PermissionMatrixTab } from './tabs/PermissionMatrixTab';
import { InheritanceHierarchyTab } from './tabs/InheritanceHierarchyTab';
import { SuperadminFunctionsTab } from './tabs/SuperadminFunctionsTab';
import { SecurityAccessTab } from './tabs/SecurityAccessTab';
import { AIPermissionsTab } from './tabs/AIPermissionsTab';
import { AuditComplianceTab } from './tabs/AuditComplianceTab';
import { PreviewSimulationTab } from './tabs/PreviewSimulationTab';
import { ModuleVisibilitySettings } from '@/components/settings/permissions/ModuleVisibilitySettings';

export const EnterpriseUserManagement: React.FC = () => {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto gap-1 p-1">
        <TabsTrigger value="users" className="flex items-center gap-1 text-xs px-2 py-2">
          <Users className="h-3 w-3" />
          <span className="hidden sm:inline">Benutzer</span>
        </TabsTrigger>
        <TabsTrigger value="roles" className="flex items-center gap-1 text-xs px-2 py-2">
          <Settings className="h-3 w-3" />
          <span className="hidden sm:inline">Rollen</span>
        </TabsTrigger>
        <TabsTrigger value="modules" className="flex items-center gap-1 text-xs px-2 py-2">
          <LayoutGrid className="h-3 w-3" />
          <span className="hidden sm:inline">Module</span>
        </TabsTrigger>
        <TabsTrigger value="permissions" className="flex items-center gap-1 text-xs px-2 py-2">
          <Shield className="h-3 w-3" />
          <span className="hidden sm:inline">Matrix</span>
        </TabsTrigger>
        <TabsTrigger value="inheritance" className="flex items-center gap-1 text-xs px-2 py-2">
          <GitBranch className="h-3 w-3" />
          <span className="hidden sm:inline">Vererbung</span>
        </TabsTrigger>
        <TabsTrigger value="superadmin" className="flex items-center gap-1 text-xs px-2 py-2">
          <Crown className="h-3 w-3" />
          <span className="hidden sm:inline">Superadmin</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-1 text-xs px-2 py-2">
          <Lock className="h-3 w-3" />
          <span className="hidden sm:inline">Sicherheit</span>
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-1 text-xs px-2 py-2">
          <Brain className="h-3 w-3" />
          <span className="hidden sm:inline">KI</span>
        </TabsTrigger>
        <TabsTrigger value="audit" className="flex items-center gap-1 text-xs px-2 py-2">
          <FileText className="h-3 w-3" />
          <span className="hidden sm:inline">Audit</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-1 text-xs px-2 py-2">
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">Vorschau</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <RolesTemplatesTab />
      </TabsContent>

      <TabsContent value="modules" className="mt-6">
        <ModuleVisibilitySettings />
      </TabsContent>

      <TabsContent value="permissions" className="mt-6">
        <PermissionMatrixTab />
      </TabsContent>

      <TabsContent value="inheritance" className="mt-6">
        <InheritanceHierarchyTab />
      </TabsContent>

      <TabsContent value="superadmin" className="mt-6">
        <SuperadminFunctionsTab />
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <SecurityAccessTab />
      </TabsContent>

      <TabsContent value="ai" className="mt-6">
        <AIPermissionsTab />
      </TabsContent>

      <TabsContent value="audit" className="mt-6">
        <AuditComplianceTab />
      </TabsContent>

      <TabsContent value="preview" className="mt-6">
        <PreviewSimulationTab />
      </TabsContent>
    </Tabs>
  );
};
