import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, LogIn, UserCog } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompaniesOverview } from "./companies/hooks/useCompaniesOverview";
import { useTenantContext } from '@/hooks/useTenantContext';
import { AssumeUserDialog } from './impersonation';

export const AdminCompanies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [impersonationDialogOpen, setImpersonationDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const navigate = useNavigate();
  const { companies, isLoading } = useCompaniesOverview();
  const { setTenantContext } = useTenantContext();

  const handleTunnelIntoCompany = async (companyId: string, companyName: string) => {
    await setTenantContext(companyId, companyName, '/employees');
  };

  const handleOpenImpersonation = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setImpersonationDialogOpen(true);
  };

  // Filtere Firmen
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchQuery === "" || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.primary_contact_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && company.is_active) ||
      (statusFilter === "trial" && company.subscription_status === 'trial');
    
    return matchesSearch && matchesStatus;
  });

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Enterprise</Badge>;
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">Premium</Badge>;
      case "Trial":
        return <Badge variant="outline" className="text-gray-600">Trial</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-gray-900 text-white hover:bg-gray-900">Active</Badge>;
      case "Trial":
        return <Badge variant="outline" className="text-gray-600">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Firmenverwaltung</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Mandanten zentral</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Neuer Mandant
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Firma, E-Mail oder Domain suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Firma</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Kontakt</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Plan</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Mitarbeiter</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Health Score</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Umsatz/Monat</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Lade Firmendaten...
                </td>
              </tr>
            ) : filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Keine Firmen gefunden
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => {
                const healthScore = 0; // Echte Daten werden später geladen
                const plan = company.subscription_status === 'enterprise' ? 'Enterprise' : 
                            company.subscription_status === 'premium' ? 'Premium' : 'Trial';
                
                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.website || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900">{company.primary_contact_name || '-'}</div>
                        <div className="text-sm text-gray-500">{company.primary_contact_email || company.billing_email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPlanBadge(plan)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(company.is_active ? 'Active' : 'Inactive')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{company.employee_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={healthScore} 
                          className="h-2 w-24"
                          indicatorClassName={getHealthScoreColor(healthScore)}
                        />
                        <span className="text-sm text-gray-700 font-medium">{healthScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">€0</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTunnelIntoCompany(company.id, company.name)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Tunneln
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenImpersonation(company.id)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <UserCog className="h-3 w-3 mr-1" />
                          Impersonate
                        </Button>
                        
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/companies/${company.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details ansehen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AssumeUserDialog
        open={impersonationDialogOpen}
        onOpenChange={setImpersonationDialogOpen}
        preselectedTenantId={selectedCompanyId}
      />
    </div>
  );
};
