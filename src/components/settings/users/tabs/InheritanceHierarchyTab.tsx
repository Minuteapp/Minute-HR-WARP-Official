import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, ChevronRight, Globe, Building2, MapPin, 
  Users, User, Shield, Lock, Unlock, ArrowRight, Info
} from 'lucide-react';

interface HierarchyLevel {
  id: string;
  name: string;
  type: 'global' | 'company' | 'location' | 'department' | 'team' | 'role' | 'user';
  icon: React.ElementType;
  children?: HierarchyLevel[];
  permissions?: PermissionOverride[];
}

interface PermissionOverride {
  module: string;
  action: string;
  status: 'inherited' | 'overridden' | 'locked';
  source: string;
  value: boolean;
}

const HIERARCHY_ICONS: Record<string, React.ElementType> = {
  global: Globe,
  company: Building2,
  location: MapPin,
  department: Users,
  team: Users,
  role: Shield,
  user: User
};

const HIERARCHY_LABELS: Record<string, string> = {
  global: 'Global',
  company: 'Gesellschaft',
  location: 'Standort',
  department: 'Abteilung',
  team: 'Team',
  role: 'Rolle',
  user: 'Benutzer'
};

const HierarchyNode: React.FC<{ node: HierarchyLevel; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const Icon = node.icon;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div 
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}
          
          <div className={`p-2 rounded-lg ${
            node.type === 'global' ? 'bg-purple-100' :
            node.type === 'company' ? 'bg-blue-100' :
            node.type === 'location' ? 'bg-green-100' :
            node.type === 'department' ? 'bg-orange-100' :
            node.type === 'team' ? 'bg-yellow-100' :
            node.type === 'role' ? 'bg-red-100' :
            'bg-gray-100'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            <div className="text-xs text-muted-foreground">{HIERARCHY_LABELS[node.type]}</div>
          </div>

          {node.permissions && node.permissions.length > 0 && (
            <div className="flex gap-1">
              {node.permissions.map((perm, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className={`text-xs ${
                    perm.status === 'inherited' ? 'border-gray-300' :
                    perm.status === 'overridden' ? 'border-blue-300 bg-blue-50' :
                    'border-red-300 bg-red-50'
                  }`}
                >
                  {perm.status === 'locked' && <Lock className="h-3 w-3 mr-1" />}
                  {perm.status === 'overridden' && <ArrowRight className="h-3 w-3 mr-1" />}
                  {perm.module}: {perm.action}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {hasChildren && (
          <CollapsibleContent>
            {node.children!.map(child => (
              <HierarchyNode key={child.id} node={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

export const InheritanceHierarchyTab: React.FC = () => {
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  
  // Lade echte Hierarchie-Daten aus der Datenbank
  const { data: hierarchy, isLoading } = useQuery({
    queryKey: ['permission-hierarchy', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      // Lade Company
      const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', companyId)
        .single();
      
      // Lade Standorte
      const { data: locations } = await supabase
        .from('company_locations')
        .select('id, name')
        .eq('company_id', companyId);
      
      // Lade Abteilungen
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', companyId);
      
      // Lade Teams
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, department_id');
      
      // Lade Rollen
      const { data: roles } = await supabase
        .from('user_roles')
        .select('id, role')
        .eq('company_id', companyId);
      
      // Baue Hierarchie auf
      const buildHierarchy = (): HierarchyLevel[] => {
        const globalNode: HierarchyLevel = {
          id: 'global',
          name: 'Globale Einstellungen',
          type: 'global',
          icon: Globe,
          children: []
        };
        
        if (company) {
          const companyNode: HierarchyLevel = {
            id: company.id,
            name: company.name,
            type: 'company',
            icon: Building2,
            children: []
          };
          
          // Füge Standorte hinzu
          (locations || []).forEach(loc => {
            const locationNode: HierarchyLevel = {
              id: loc.id,
              name: loc.name,
              type: 'location',
              icon: MapPin,
              children: []
            };
            companyNode.children?.push(locationNode);
          });
          
          // Füge Abteilungen hinzu
          (departments || []).forEach(dept => {
            const deptNode: HierarchyLevel = {
              id: dept.id,
              name: dept.name,
              type: 'department',
              icon: Users,
              children: []
            };
            
            // Füge Teams zur Abteilung hinzu
            (teams || []).filter(t => t.department_id === dept.id).forEach(team => {
              const teamNode: HierarchyLevel = {
                id: team.id,
                name: team.name,
                type: 'team',
                icon: Users
              };
              deptNode.children?.push(teamNode);
            });
            
            companyNode.children?.push(deptNode);
          });
          
          // Füge Rollen hinzu
          const uniqueRoles = [...new Set((roles || []).map(r => r.role))];
          uniqueRoles.forEach(role => {
            const roleNode: HierarchyLevel = {
              id: `role-${role}`,
              name: role,
              type: 'role',
              icon: Shield
            };
            companyNode.children?.push(roleNode);
          });
          
          globalNode.children?.push(companyNode);
        }
        
        return [globalNode];
      };
      
      return buildHierarchy();
    },
    enabled: !!companyId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Erklärung */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-800">
              <p className="font-medium">Vererbungs- und Überschreibungslogik</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Geerbt:</strong> Berechtigung wird von einer höheren Ebene übernommen</li>
                <li><strong>Überschrieben:</strong> Berechtigung wurde auf dieser Ebene explizit geändert</li>
                <li><strong>Gesperrt:</strong> Berechtigung kann auf niedrigeren Ebenen nicht mehr geändert werden</li>
                <li><strong>Sperren sind immer stärker als Erlaubnisse</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchie-Baum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Berechtigungs-Hierarchie
          </CardTitle>
          <CardDescription>
            Visualisierung der Vererbung von Berechtigungen durch alle Ebenen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hierarchy && hierarchy.length > 0 ? (
            <div className="border rounded-lg p-4">
              {hierarchy.map(node => (
                <HierarchyNode key={node.id} node={node} level={0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Hierarchie-Daten</h3>
              <p className="text-muted-foreground">
                Erstellen Sie zuerst Standorte, Abteilungen und Teams, um die Hierarchie zu visualisieren.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(HIERARCHY_LABELS).map(([type, label]) => {
              const Icon = HIERARCHY_ICONS[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    type === 'global' ? 'bg-purple-100' :
                    type === 'company' ? 'bg-blue-100' :
                    type === 'location' ? 'bg-green-100' :
                    type === 'department' ? 'bg-orange-100' :
                    type === 'team' ? 'bg-yellow-100' :
                    type === 'role' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status-Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Berechtigungs-Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gray-300">
                Geerbt
              </Badge>
              <span className="text-sm text-muted-foreground">Von höherer Ebene übernommen</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-blue-300 bg-blue-50">
                <ArrowRight className="h-3 w-3 mr-1" />
                Überschrieben
              </Badge>
              <span className="text-sm text-muted-foreground">Auf dieser Ebene geändert</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-red-300 bg-red-50">
                <Lock className="h-3 w-3 mr-1" />
                Gesperrt
              </Badge>
              <span className="text-sm text-muted-foreground">Kann nicht mehr geändert werden</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
