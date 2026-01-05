import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CompanyNotFound } from './components/CompanyNotFound';
import { CompanyDetailsSkeleton } from './components/CompanyDetailsSkeleton';
import { useCompanyDetailsPage } from './hooks/useCompanyDetailsPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, ShieldCheck, DollarSign, HardDrive, LogIn } from 'lucide-react';
import { useTenantContext } from '@/hooks/useTenantContext';
import { CompanyOverviewTab } from './tabs/CompanyOverviewTab';
import { CompanyEmployeesTab } from './tabs/CompanyEmployeesTab';
import { CompanyAdminsTab } from './tabs/CompanyAdminsTab';
import { CompanyBillingTab } from './tabs/CompanyBillingTab';
import { CompanyActivityTab } from './tabs/CompanyActivityTab';
import AddCompanyAdminDialog from '../AddCompanyAdminDialog';
import { CompanyRoleSettings } from '@/pages/admin/companies/CompanyRoleSettings';

export const CompanyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { companyId: rawCompanyId } = useParams<{ companyId: string }>();
  
  const {
    companyId,
    company,
    isLoading,
    notFound,
    error,
    isAddAdminDialogOpen,
    setIsAddAdminDialogOpen,
    handleAddAdmin,
    handleResendInvitation,
    refreshCompanyDetails,
    handleBack
  } = useCompanyDetailsPage(rawCompanyId);

  const [activeTab, setActiveTab] = useState('overview');
  const { setTenantContext } = useTenantContext();

  const handleTunnelIntoCompany = async () => {
    await setTenantContext(company.id, company.name, '/employees');
  };

  if (isLoading) {
    return <CompanyDetailsSkeleton />;
  }

  if (notFound || !company) {
    return <CompanyNotFound onBack={handleBack} onRetry={refreshCompanyDetails} error={error} />;
  }

  const employeeCount = company.employee_count || 0;
  const adminCount = company.companyAdmins?.length || company.admins?.length || 0;
  const monthlyRevenue = company.monthly_revenue || 0;
  const storageUsed = company.storage_used || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{company.name}</h1>
              <Badge variant={company.is_active ? 'default' : 'secondary'} className="bg-black text-white">
                {company.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Mandanten-ID: {company.id}</span>
              <Badge variant="secondary" className="text-xs bg-gray-100">Vorschau</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleTunnelIntoCompany}
          >
            <LogIn className="h-4 w-4 mr-2" />
            In Firma tunneln
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">Bearbeiten</Button>
        </div>
      </div>

      {/* Metrikkarten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Mitarbeiter</div>
                <div className="text-2xl font-bold">{employeeCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Admins</div>
                <div className="text-2xl font-bold">{adminCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Umsatz/Monat</div>
                <div className="text-2xl font-bold">€{monthlyRevenue}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Speicher</div>
                <div className="text-2xl font-bold">{storageUsed} MB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Übersicht
          </TabsTrigger>
          <TabsTrigger 
            value="employees" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Mitarbeiter ({employeeCount})
          </TabsTrigger>
          <TabsTrigger 
            value="admins" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Admins ({adminCount})
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Rechnungshistorie
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Aktivität
          </TabsTrigger>
          <TabsTrigger 
            value="roles" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
          >
            Rollenkonfiguration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CompanyOverviewTab company={company} />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <CompanyEmployeesTab company={company} />
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <CompanyAdminsTab
            companyId={companyId || ''}
            companyAdmins={company.companyAdmins || company.admins || []}
            onAddAdmin={() => setIsAddAdminDialogOpen(true)}
            onResendInvitation={handleResendInvitation}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <CompanyBillingTab company={company} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <CompanyActivityTab company={company} />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <CompanyRoleSettings 
            companyId={company.id} 
            companyName={company.name} 
          />
        </TabsContent>
      </Tabs>

      <AddCompanyAdminDialog
        open={isAddAdminDialogOpen}
        onOpenChange={setIsAddAdminDialogOpen}
        onAddAdmin={handleAddAdmin}
        companyName={company.name}
      />
    </div>
  );
};
