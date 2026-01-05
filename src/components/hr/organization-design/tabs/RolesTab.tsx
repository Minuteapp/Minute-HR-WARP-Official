import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Plus, Edit, CheckCircle } from "lucide-react";
import { rolesManagementService } from "@/services/rolesManagementService";
import { OrgChartSidebar } from "../components/OrgChartSidebar";

export const RolesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles-with-succession'],
    queryFn: () => rolesManagementService.getRolesWithSuccessionStatus(),
  });

  const { data: stats } = useQuery({
    queryKey: ['role-statistics'],
    queryFn: () => rolesManagementService.getRoleStatistics(),
  });

  const filteredRoles = roles.filter(role =>
    role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Vollständig</Badge>;
      case 'gap':
        return <Badge variant="destructive">Nachfolgelücke</Badge>;
      case 'overlap':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Überschneidung</Badge>;
      default:
        return <Badge variant="outline">Unbekannt</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Lädt Rollen...</div>;
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        {/* KI-Analyse Alert */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <span className="font-semibold">KI-Analyse:</span> {stats?.gaps || 2} Rolle(n) ohne Nachfolge gefunden. {stats?.overlaps || 2} Rollenüberschneidung(en) erkannt. 
            <span className="font-semibold"> Empfehlung:</span> Nachfolgeplanung prüfen und Rollendefinitionen schärfen.
          </AlertDescription>
        </Alert>

        {/* Suche und Button */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rolle oder Abteilung suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Rolle hinzufügen
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Rolle</th>
                  <th className="text-left py-3 px-4 font-medium">Abteilung</th>
                  <th className="text-left py-3 px-4 font-medium">Berichtet an</th>
                  <th className="text-center py-3 px-4 font-medium">Nachfolger</th>
                  <th className="text-left py-3 px-4 font-medium">Verantwortungen</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{role.role}</td>
                    <td className="py-3 px-4">{role.department}</td>
                    <td className="py-3 px-4">{role.reportsTo}</td>
                    <td className="text-center py-3 px-4">
                      {role.successors > 0 ? (
                        <Badge variant="outline">{role.successors}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{role.responsibilities}</td>
                    <td className="py-3 px-4">{getStatusBadge(role.status)}</td>
                    <td className="text-center py-3 px-4">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gesamt-Statistik am Ende der Tabelle */}
            {stats && (
              <div className="border-t-2 border-gray-300 mt-2 pt-4 px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Gesamt Rollen</span>
                    <span className="text-xl font-bold">{stats.total}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Vollständig</span>
                      <span className="text-lg font-bold text-green-600">{stats.complete}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm">Nachfolgelücken</span>
                      <span className="text-lg font-bold text-orange-600">{stats.gaps}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm">Überschneidungen</span>
                      <span className="text-lg font-bold text-yellow-600">{stats.overlaps}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Rechte Sidebar */}
      <div className="w-80">
        <OrgChartSidebar />
      </div>
    </div>
  );
};