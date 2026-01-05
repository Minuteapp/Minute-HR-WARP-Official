import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Users, MapPin, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useSuperadminApi } from "@/hooks/useSuperadminApi";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TenantOrgStructureTabProps {
  tenantId: string;
}

export const TenantOrgStructureTab = ({ tenantId }: TenantOrgStructureTabProps) => {
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const { bootstrapOrg } = useSuperadminApi();
  const { toast } = useToast();

  // Fetch existing org structure
  const { data: locations, isLoading: locationsLoading, refetch: refetchLocations } = useQuery({
    queryKey: ['tenant-locations', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, is_active')
        .eq('company_id', tenantId);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: departments, isLoading: departmentsLoading, refetch: refetchDepartments } = useQuery({
    queryKey: ['tenant-departments', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, code, is_active')
        .eq('company_id', tenantId);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['tenant-teams', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, department_id')
        .eq('company_id', tenantId);
      if (error) throw error;
      return data || [];
    }
  });

  const isLoading = locationsLoading || departmentsLoading || teamsLoading;

  const handleBootstrap = async () => {
    setIsBootstrapping(true);
    try {
      const result = await bootstrapOrg(tenantId);
      
      const createdItems = [];
      if (result.created.site_id) createdItems.push('Standort');
      if (result.created.department_id) createdItems.push('Abteilung');
      if (result.created.team_id) createdItems.push('Team');

      if (createdItems.length > 0) {
        toast({
          title: "Org-Struktur erstellt",
          description: `Erstellt: ${createdItems.join(', ')}`,
        });
      } else {
        toast({
          title: "Bereits vorhanden",
          description: "Alle Org-Elemente existieren bereits.",
        });
      }

      // Refetch data
      refetchLocations();
      refetchDepartments();
      refetchTeams();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Bootstrap fehlgeschlagen",
      });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const hasNoOrgStructure = 
    (!locations || locations.length === 0) &&
    (!departments || departments.length === 0) &&
    (!teams || teams.length === 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bootstrap Section */}
      {hasNoOrgStructure && (
        <Card className="border-dashed border-2 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-5 h-5" />
              Keine Org-Struktur vorhanden
            </CardTitle>
            <CardDescription>
              Erstellen Sie mit einem Klick eine minimale Organisationsstruktur (Standort, Abteilung, Team).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleBootstrap} 
              disabled={isBootstrapping}
              className="bg-primary hover:bg-primary/90"
            >
              {isBootstrapping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Org-Struktur erstellen (Bootstrap)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Locations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Standorte</CardTitle>
            <Badge variant="outline">{locations?.length || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {locations && locations.length > 0 ? (
            <div className="space-y-2">
              {locations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="font-medium">{location.name}</span>
                  <Badge variant={location.is_active ? "default" : "secondary"}>
                    {location.is_active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Standorte vorhanden</p>
          )}
        </CardContent>
      </Card>

      {/* Departments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Abteilungen</CardTitle>
            <Badge variant="outline">{departments?.length || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {departments && departments.length > 0 ? (
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <span className="font-medium">{dept.name}</span>
                    {dept.code && (
                      <span className="ml-2 text-xs text-muted-foreground">({dept.code})</span>
                    )}
                  </div>
                  <Badge variant={dept.is_active ? "default" : "secondary"}>
                    {dept.is_active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Abteilungen vorhanden</p>
          )}
        </CardContent>
      </Card>

      {/* Teams */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Teams</CardTitle>
            <Badge variant="outline">{teams?.length || 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {teams && teams.length > 0 ? (
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="font-medium">{team.name}</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Teams vorhanden</p>
          )}
        </CardContent>
      </Card>

      {/* Bootstrap button if partial */}
      {!hasNoOrgStructure && (
        <div className="flex justify-end">
          <Button 
            variant="outline"
            onClick={handleBootstrap} 
            disabled={isBootstrapping}
          >
            {isBootstrapping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ergänze...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Fehlende Elemente ergänzen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
