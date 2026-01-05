
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyInfoTab } from "../tabs/CompanyInfoTab";
import { CompanyDetailsTab } from "../tabs/CompanyDetailsTab";
import { CompanyLicenseTab } from "../tabs/CompanyLicenseTab";
import { CompanyEmployeesTab } from "../tabs/CompanyEmployeesTab";
import { CompanySettingsTab } from "../tabs/CompanySettingsTab";
import { CompanyAdminsTab } from "../tabs/CompanyAdminsTab";
import { CompanyDetails } from "../types";

interface CompanyContentProps {
  company: CompanyDetails;
  companyId: string;
  onAddAdmin: () => void;
  onResendInvitation: (email: string) => Promise<void>;
  onEditAdmin?: (admin: any) => void;
  onDeleteAdmin?: (adminId: string, adminEmail: string) => Promise<void>;
  onUpdate?: () => void;
}

export const CompanyContent = ({ 
  company, 
  companyId,
  onAddAdmin,
  onResendInvitation,
  onEditAdmin,
  onDeleteAdmin,
  onUpdate = () => {}
}: CompanyContentProps) => {
  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList className="bg-white border border-primary/30 p-1 rounded-md shadow-sm grid w-full grid-cols-6">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="license">Lizenz</TabsTrigger>
        <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
        <TabsTrigger value="admins">Administratoren</TabsTrigger>
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="settings">Einstellungen</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanyDetailsTab company={company} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="license" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanyLicenseTab company={company} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="employees" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanyEmployeesTab company={company} />
      </TabsContent>

      <TabsContent value="info" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanyInfoTab company={company} />
      </TabsContent>

      <TabsContent value="admins" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanyAdminsTab 
          companyId={companyId} 
          companyAdmins={company.admins || []} 
          onAddAdmin={onAddAdmin}
          onResendInvitation={onResendInvitation}
          onEditAdmin={onEditAdmin}
          onDeleteAdmin={onDeleteAdmin}
        />
      </TabsContent>

      <TabsContent value="settings" className="p-6 bg-white rounded-lg shadow-md border border-primary/30">
        <CompanySettingsTab companyId={companyId} company={company} />
      </TabsContent>
    </Tabs>
  );
};
