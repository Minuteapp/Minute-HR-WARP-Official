import { AdminCompanies } from "@/components/admin/AdminCompanies";
import { AdminEmployees } from "@/components/admin/AdminEmployees";
import { AdminStatistics } from "@/components/admin/AdminStatistics";
import { AdminBilling } from "@/components/admin/AdminBilling";
import { useAuth } from "@/contexts/AuthContext";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { Route, Routes } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { uploadLogo } from "@/utils/uploadLogo";
import { CompanyDetails } from "@/components/admin/companies/CompanyDetails";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminHeader } from "@/components/admin/AdminHeader";
import AdminUsersManagement from "./AdminUsersManagement";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminSecuritySettings from "./AdminSecuritySettings";
import AdminSystemSettings from "./AdminSystemSettings";
import GlossaryAdmin from "./GlossaryAdmin";
import ImpactMatrixAdmin from "./ImpactMatrixAdmin";
import { AdminDashboardTab } from "@/components/admin/tabs/AdminDashboardTab";
import { TenantManagementTab } from "@/components/admin/tabs/TenantManagementTab";
import { TenantDetailView } from "@/components/admin/tenants/TenantDetailView";
import UsersRolesTab from "@/components/admin/tabs/UsersRolesTab";
import SubscriptionsPaymentsTab from "@/components/admin/tabs/SubscriptionsPaymentsTab";
import ModulesFeaturesTab from "@/components/admin/tabs/ModulesFeaturesTab";
import SystemStatusTab from "@/components/admin/tabs/SystemStatusTab";
import SecurityComplianceTab from "@/components/admin/tabs/SecurityComplianceTab";
import LogsAuditsTab from "@/components/admin/tabs/LogsAuditsTab";
import AdminSettingsTab from "@/components/admin/tabs/AdminSettingsTab";
import SupportTicketingPage from "@/components/admin/support/SupportTicketingPage";
import SupportTicketDetailView from "@/components/admin/support/SupportTicketDetailView";
import { SuperadminAuditTab } from "@/components/admin/tabs/SuperadminAuditTab";

const AdminPage = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useRolePermissions();
  const { toast } = useToast();
  
  console.log("=== ADMIN PAGE DIAGNOSTICS ===");
  console.log("Admin page loaded with user:", user?.email);
  console.log("User role from metadata:", user?.user_metadata?.role);
  console.log("User role direct:", user?.role);
  console.log("SuperAdmin-Berechtigung:", isSuperAdmin);
  
  useEffect(() => {
    console.log("SUCCESS: Admin dashboard rendered - ONLY FOR SUPERADMIN");
    uploadLogo().catch(err => console.error("Error uploading logo:", err));
  }, []);
  
  console.log("✅ Admin-Seite wird für SuperAdmin gerendert");

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <div className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="tenants/:tenantId" element={<TenantDetailView />} />
            <Route path="tenants" element={<TenantManagementTab />} />
            <Route path="users-roles" element={<UsersRolesTab />} />
            <Route path="subscriptions" element={<SubscriptionsPaymentsTab />} />
            <Route path="modules" element={<ModulesFeaturesTab />} />
            <Route path="system-status" element={<SystemStatusTab />} />
            <Route path="support/tickets/:ticketId" element={<SupportTicketDetailView />} />
            <Route path="support/*" element={<SupportTicketingPage />} />
            <Route path="security-compliance" element={<SecurityComplianceTab />} />
            <Route path="logs-audits" element={<LogsAuditsTab />} />
            <Route path="admin-settings" element={<AdminSettingsTab />} />
            <Route path="companies/:companyId" element={<CompanyDetails />} />
            <Route path="companies" element={<AdminCompanies />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="users" element={<AdminUsersManagement />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="logs" element={<AdminAuditLogs />} />
            <Route path="security" element={<AdminSecuritySettings />} />
            <Route path="settings" element={<AdminSystemSettings />} />
            <Route path="glossary" element={<GlossaryAdmin />} />
            <Route path="impact-matrix" element={<ImpactMatrixAdmin />} />
            <Route path="superadmin-audit" element={<SuperadminAuditTab />} />
            <Route path="/" element={<AdminDashboardTab />} />
            <Route path="*" element={<AdminDashboardTab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
