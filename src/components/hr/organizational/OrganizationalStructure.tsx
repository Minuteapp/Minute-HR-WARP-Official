
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrgStructureDialog } from "./OrgStructureDialog";

export const OrganizationalStructure = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const { data: structure, isLoading } = useQuery({
    queryKey: ['organizational-structure'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizational_structure')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: locations } = useQuery({
    queryKey: ['hr-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_locations')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Organisationsstruktur</h2>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Organisationseinheit
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organisationshierarchie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {structure?.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  style={{ marginLeft: `${node.level * 20}px` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{node.name}</h3>
                      <p className="text-sm text-gray-500">{node.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Level {node.level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedNode(node);
                        setShowDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Standorte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations?.map((location) => (
                <div
                  key={location.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{location.name}</h3>
                    <Badge variant={location.location_type === 'headquarters' ? 'default' : 'secondary'}>
                      {location.location_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {location.address}, {location.city}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-3 w-3" />
                    <span>{location.capacity || 0} Plätze</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <OrgStructureDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        node={selectedNode}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedNode(null);
        }}
      />
    </div>
  );
};
