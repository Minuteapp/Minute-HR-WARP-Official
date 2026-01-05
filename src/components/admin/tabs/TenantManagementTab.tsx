import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Users, Eye, Calendar, Globe, LogIn, UserCog, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantContext } from "@/hooks/useTenantContext";
import { AssumeUserDialog } from "@/components/admin/impersonation/AssumeUserDialog";
import { useCompaniesOverview } from "@/components/admin/companies/hooks/useCompaniesOverview";
import { useTenantStats } from "@/hooks/useTenantStats";
import { TenantQuickViewDialog } from "@/components/admin/tenants/TenantQuickViewDialog";
import { TenantActionsMenu } from "@/components/admin/tenants/TenantActionsMenu";
import { NewCompanyDialog } from "@/components/admin/companies/NewCompanyDialog";
import { createCompany } from "@/components/admin/companies/services/createCompany";
import { initializeNewCompany } from "@/components/admin/companies/services/companyInitializationService";
import { toast } from "sonner";
import { CompanyFormData } from "@/components/admin/companies/types";

export const TenantManagementTab = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [impersonationDialogOpen, setImpersonationDialogOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isNewCompanyDialogOpen, setIsNewCompanyDialogOpen] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const navigate = useNavigate();
  const { setTenantContext } = useTenantContext();
  const { companies, isLoading, refetch: refetchCompanies } = useCompaniesOverview();

  // Hole dynamische Stats für alle Companies
  const companyIds = useMemo(() => companies.map(c => c.id), [companies]);
  const { data: tenantStats } = useTenantStats(companyIds);

  // Map companies to tenant format mit echten Stats
  const tenants = useMemo(() => {
    return companies.map(company => {
      const stats = tenantStats?.[company.id] || { admins: 0, modules: 0, lastActivity: null, country: 'Deutschland' };
      
      return {
        id: company.id,
        name: company.name,
        status: company.is_active ? (company.subscription_status === 'trial' ? 'test' : 'active') : 'suspended',
        country: stats.country,
        region: stats.country === 'Deutschland' ? 'EU-DE' : stats.country === 'Österreich' ? 'EU-AT' : stats.country === 'Schweiz' ? 'CH' : 'EU',
        employees: company.employee_count || 0,
        admins: stats.admins,
        tariff: company.subscription_status === 'enterprise' ? 'Enterprise' : company.subscription_status === 'pro' ? 'Pro' : 'Basic',
        modules: stats.modules,
        lastActivity: stats.lastActivity,
        email: company.billing_email || company.primary_contact_email,
        phone: company.phone,
        website: company.website
      };
    });
  }, [companies, tenantStats]);

  // Calculate status counts dynamically
  const statusTabs = useMemo(() => [
    { value: "all", label: "Alle", count: tenants.length },
    { value: "active", label: "Aktive", count: tenants.filter(t => t.status === 'active').length },
    { value: "test", label: "Test", count: tenants.filter(t => t.status === 'test').length },
    { value: "suspended", label: "Gesperrt", count: tenants.filter(t => t.status === 'suspended').length },
    { value: "archived", label: "Archiviert", count: tenants.filter(t => t.status === 'archived').length },
  ], [tenants]);

  const handleTunnelIntoTenant = async (tenantId: string, tenantName: string) => {
    await setTenantContext(tenantId, tenantName, '/employees');
  };

  const handleOpenImpersonation = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setImpersonationDialogOpen(true);
  };

  const handleQuickView = (tenant: any) => {
    setSelectedTenant(tenant);
    setQuickViewOpen(true);
  };

  const handleCreateCompany = async (formData: CompanyFormData) => {
    setIsCreatingCompany(true);
    try {
      const newCompany = await createCompany(formData);
      await initializeNewCompany(newCompany.id, formData.email);
      setIsNewCompanyDialogOpen(false);
      await refetchCompanies();
      toast.success(`Firma "${formData.name}" wurde erfolgreich angelegt!`);
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesStatus = activeTab === "all" || tenant.status === activeTab;
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tenant.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktiv</Badge>;
      case "test":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Test</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Gesperrt</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Archiviert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatLastActivity = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Mandanten...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mandantenverwaltung</h2>
          <p className="text-sm text-muted-foreground">{tenants.length} Mandanten insgesamt</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsNewCompanyDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Mandant
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
          {statusTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3"
            >
              {tab.label} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Mandant suchen (Name oder ID)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Tenants Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mandant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Land/Region</TableHead>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead>Admins</TableHead>
                <TableHead>Tarif</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Letzte Aktivität</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/tenants/${tenant.id}`)}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.id.substring(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{tenant.country}</span>
                      <span className="text-xs text-muted-foreground">({tenant.region})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {tenant.employees}
                    </div>
                  </TableCell>
                  <TableCell>{tenant.admins}</TableCell>
                  <TableCell>
                    <span className="text-primary font-medium cursor-pointer hover:underline">{tenant.tariff}</span>
                  </TableCell>
                  <TableCell>{tenant.modules} aktiv</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatLastActivity(tenant.lastActivity)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTunnelIntoTenant(tenant.id, tenant.name)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 h-8"
                      >
                        <LogIn className="w-3 h-3 mr-1" />
                        Tunneln
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenImpersonation(tenant.id)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50 h-8"
                      >
                        <UserCog className="w-3 h-3 mr-1" />
                        Impersonate
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleQuickView(tenant)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <TenantActionsMenu
                        tenantId={tenant.id}
                        tenantName={tenant.name}
                        status={tenant.status}
                        onEdit={() => navigate(`/admin/tenants/${tenant.id}`)}
                        onActionComplete={() => refetchCompanies()}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AssumeUserDialog
        open={impersonationDialogOpen}
        onOpenChange={setImpersonationDialogOpen}
        preselectedTenantId={selectedTenantId}
      />

      <TenantQuickViewDialog
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        tenant={selectedTenant}
      />

      <NewCompanyDialog
        isOpen={isNewCompanyDialogOpen}
        onOpenChange={setIsNewCompanyDialogOpen}
        onSubmit={handleCreateCompany}
        isSubmitting={isCreatingCompany}
      />
    </div>
  );
};
