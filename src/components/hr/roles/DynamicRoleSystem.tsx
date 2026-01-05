
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Shield, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DynamicRoleSystem = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['hr-dynamic-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_dynamic_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dynamisches Rollensystem</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Rolle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles?.length || 0}</p>
                <p className="text-sm text-gray-500">Rollen definiert</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles?.filter(r => r.is_active).length || 0}</p>
                <p className="text-sm text-gray-500">Aktive Rollen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Zugewiesene Benutzer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Rollenübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles?.length > 0 ? (
              roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                      <p className="text-xs text-gray-400">
                        Berechtigung Level: {role.permission_level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine benutzerdefinierten Rollen erstellt</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
