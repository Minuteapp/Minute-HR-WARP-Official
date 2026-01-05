import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Users, Layers, TrendingUp, CreditCard, Shield, Settings, Loader2, Network } from "lucide-react";
import { TenantStammdatenTab } from "./tabs/TenantStammdatenTab";
import { TenantNutzerAdminsTab } from "./tabs/TenantNutzerAdminsTab";
import { TenantModuleLimitsTab } from "./tabs/TenantModuleLimitsTab";
import { TenantNutzungKPIsTab } from "./tabs/TenantNutzungKPIsTab";
import { TenantAbrechnungTab } from "./tabs/TenantAbrechnungTab";
import { TenantComplianceLogsTab } from "./tabs/TenantComplianceLogsTab";
import { TenantOrgStructureTab } from "./tabs/TenantOrgStructureTab";
import { useTenantDetails } from "@/hooks/useTenantDetails";
import { TenantRoleImpersonationButtons } from "./TenantRoleImpersonationButtons";

export const TenantDetailView = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const { data: tenant, isLoading, error } = useTenantDetails(tenantId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Mandant...</span>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Mandant nicht gefunden</h1>
            <p className="text-sm text-muted-foreground">Der angeforderte Mandant existiert nicht.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (tenant.status) {
      case 'active': return <Badge variant="outline" className="border-green-500 text-green-600">Aktiv</Badge>;
      case 'suspended': return <Badge variant="outline" className="border-red-500 text-red-600">Gesperrt</Badge>;
      default: return <Badge variant="outline">{tenant.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{tenant.name}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">{tenant.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TenantRoleImpersonationButtons tenantId={tenant.id} />
          <div className="flex items-center gap-2">
            <Button variant="outline">Sperren</Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stammdaten" className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto overflow-x-auto flex-nowrap">
          <TabsTrigger value="stammdaten" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />Stammdaten
          </TabsTrigger>
          <TabsTrigger value="nutzer" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />Nutzer & Admins
          </TabsTrigger>
          <TabsTrigger value="module" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />Module & Limits
          </TabsTrigger>
          <TabsTrigger value="nutzung" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />Nutzung & KPIs
          </TabsTrigger>
          <TabsTrigger value="abrechnung" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />Abrechnung
          </TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />Compliance & Logs
          </TabsTrigger>
          <TabsTrigger value="org" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3 flex items-center gap-2">
            <Network className="w-4 h-4" />Org-Struktur
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="stammdaten">
            <TenantStammdatenTab tenant={tenant} />
          </TabsContent>
          <TabsContent value="nutzer">
            <TenantNutzerAdminsTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="module">
            <TenantModuleLimitsTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="nutzung">
            <TenantNutzungKPIsTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="abrechnung">
            <TenantAbrechnungTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="compliance">
            <TenantComplianceLogsTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="org">
            <TenantOrgStructureTab tenantId={tenant.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};