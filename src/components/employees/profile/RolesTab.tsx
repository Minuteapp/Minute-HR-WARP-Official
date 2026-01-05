
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Calendar, User, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RolesTabProps {
  employeeId: string;
}

export const RolesTab = ({ employeeId }: RolesTabProps) => {
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['userRoles', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', employeeId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['userPermissions', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', employeeId);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'hr': return 'Personalwesen';
      case 'employee': return 'Mitarbeiter';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Rollen & Berechtigungen</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Rolle hinzufügen
        </Button>
      </div>

      {/* Aktuelle Rollen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Zugewiesene Rollen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine Rollen zugewiesen</p>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole: any) => (
                <div key={userRole.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <h3 className="font-medium">{getRoleLabel(userRole.role)}</h3>
                    </div>
                    <Badge className={getRoleColor(userRole.role)}>
                      {getRoleLabel(userRole.role)}
                    </Badge>
                  </div>
                  {userRole.assigned_at && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Zugewiesen: {new Date(userRole.assigned_at).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Berechtigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine spezifischen Berechtigungen</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissions.map((permission: any) => (
                <div key={permission.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">{permission.permission_name}</span>
                  </div>
                  {permission.description && (
                    <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
