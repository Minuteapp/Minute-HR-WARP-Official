import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTravelRoles, useAllTravelRolePermissions, CATEGORY_LABELS } from "@/hooks/useTravelRoles";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardPreviewContent } from './DashboardPreviewContent';
import { RoleComparisonContent } from './RoleComparisonContent';
import { formatCurrency } from '@/lib/utils';
import { 
  Shield, Users, UserCog, User, ArrowRight, Eye, CheckCircle, 
  BarChart3, GitCompare, Settings, Check, X, Plane, Receipt,
  LayoutDashboard, Sparkles
} from 'lucide-react';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield className="h-5 w-5" />,
  'users-cog': <Users className="h-5 w-5" />,
  'user-cog': <UserCog className="h-5 w-5" />,
  user: <User className="h-5 w-5" />
};

const ROLE_COLORS: Record<string, string> = {
  violet: 'border-violet-500 bg-violet-50',
  blue: 'border-blue-500 bg-blue-50',
  orange: 'border-orange-500 bg-orange-50',
  green: 'border-green-500 bg-green-50'
};

const ROLE_ICON_BG: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600'
};

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="h-4 w-4" />,
  travel_requests: <Plane className="h-4 w-4" />,
  expenses: <Receipt className="h-4 w-4" />,
  employee_management: <Users className="h-4 w-4" />,
  reporting: <BarChart3 className="h-4 w-4" />,
  administration: <Settings className="h-4 w-4" />,
  additional: <Sparkles className="h-4 w-4" />
};

export function RolesAndDemoTab() {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showNoPermissionModal, setShowNoPermissionModal] = useState(false);
  const { user } = useAuth();
  
  const { data: roles = [], isLoading: rolesLoading } = useTravelRoles();
  const { data: allPermissions = [], isLoading: permsLoading } = useAllTravelRolePermissions();

  const currentRole = roles.find(r => r.role_key === selectedRole) || roles[0];

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  // Get unique features per category
  const getUniqueFeatures = (category: string) => {
    const categoryPerms = permissionsByCategory[category] || [];
    const uniqueFeatures = new Map<string, string>();
    categoryPerms.forEach(p => {
      if (!uniqueFeatures.has(p.feature_key)) {
        uniqueFeatures.set(p.feature_key, p.feature_label);
      }
    });
    return Array.from(uniqueFeatures.entries());
  };

  const getPermissionStatus = (roleKey: string, category: string, featureKey: string) => {
    const perm = allPermissions.find(
      p => p.role_key === roleKey && p.category === category && p.feature_key === featureKey
    );
    return perm?.granted || false;
  };

  const handleRoleSwitch = (roleKey: string) => {
    // In real app, check if user has permission
    setSelectedRole(roleKey);
  };

  if (rolesLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Rollenbasierte Ansichten</h2>
          <p className="text-muted-foreground">
            Vergleichen Sie die verschiedenen Benutzerrollen und ihre Berechtigungen
          </p>
        </div>
      </div>

      {/* Current Role Card */}
      {currentRole && (
        <Card className={`border-2 ${ROLE_COLORS[currentRole.color || 'violet']}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${ROLE_ICON_BG[currentRole.color || 'violet']}`}>
                  {ROLE_ICONS[currentRole.icon || 'shield']}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Aktuelle Rolle:</span>
                    <span className="font-semibold">{currentRole.role_name}</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Aktiv</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentRole.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-muted-foreground">Employees</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-muted-foreground">Departments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">€485k</p>
                  <p className="text-muted-foreground">Budget</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">47</p>
                  <p className="text-muted-foreground">Permissions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Eye className="h-4 w-4" />
            Rollenübersicht
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Berechtigungen
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard-Vorschau
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Vergleich
          </TabsTrigger>
        </TabsList>

        {/* Rollenübersicht */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === role.role_key ? `border-2 ${ROLE_COLORS[role.color || 'violet']}` : ''
                }`}
                onClick={() => handleRoleSwitch(role.role_key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ROLE_ICON_BG[role.color || 'violet']}`}>
                        {ROLE_ICONS[role.icon || 'user']}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {role.role_name}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                      </div>
                    </div>
                    {selectedRole === role.role_key && (
                      <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4 text-center text-sm">
                    <div className="p-2 bg-muted rounded">
                      <p className="font-bold">156</p>
                      <p className="text-xs text-muted-foreground">Employees</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Departments</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="font-bold">€485k</p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="font-bold">47</p>
                      <p className="text-xs text-muted-foreground">Permissions</p>
                    </div>
                  </div>

                  <p className="text-sm font-medium mb-2">Hauptfunktionen:</p>
                  <div className="space-y-1">
                    {(role.main_features || []).slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {(role.main_features || []).length > 3 && (
                      <p className="text-xs text-primary cursor-pointer hover:underline">
                        +{(role.main_features || []).length - 3} weitere Funktionen
                      </p>
                    )}
                  </div>

                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Zu dieser Rolle wechseln
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Berechtigungen Matrix */}
        <TabsContent value="permissions" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Rollen & Berechtigungen</h3>
              <p className="text-sm text-muted-foreground">
                Übersicht der Funktionen und Zugriffsrechte nach Benutzerrolle
              </p>
            </div>
            <div className="flex gap-1">
              {roles.map(role => (
                <Button
                  key={role.role_key}
                  variant={selectedRole === role.role_key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role.role_key)}
                >
                  {role.role_name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Permission Categories */}
          {Object.keys(CATEGORY_LABELS).map(category => {
            const features = getUniqueFeatures(category);
            if (features.length === 0) return null;
            
            return (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {CATEGORY_ICON_MAP[category]}
                    {CATEGORY_LABELS[category]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Funktion</th>
                        {roles.map(role => (
                          <th key={role.role_key} className="text-center py-2 font-medium w-24">
                            {role.role_name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(([featureKey, featureLabel]) => (
                        <tr key={featureKey} className="border-b last:border-0">
                          <td className="py-2">{featureLabel}</td>
                          {roles.map(role => {
                            const granted = getPermissionStatus(role.role_key, category, featureKey);
                            const isCurrentRole = role.role_key === selectedRole;
                            return (
                              <td key={role.role_key} className="text-center py-2">
                                {granted ? (
                                  <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                    isCurrentRole ? 'bg-green-100' : 'bg-muted'
                                  }`}>
                                    <Check className={`h-4 w-4 ${isCurrentRole ? 'text-green-600' : 'text-muted-foreground'}`} />
                                  </div>
                                ) : (
                                  <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
                                    isCurrentRole ? 'bg-red-100' : 'bg-muted'
                                  }`}>
                                    <X className={`h-4 w-4 ${isCurrentRole ? 'text-red-600' : 'text-muted-foreground'}`} />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })}

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <span>Berechtigung vorhanden (Ihre Rolle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <Check className="h-4 w-4 text-muted-foreground" />
              </div>
              <span>Berechtigung vorhanden</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <span>Keine Berechtigung (Ihre Rolle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </div>
              <span>Keine Berechtigung</span>
            </div>
          </div>
        </TabsContent>

        {/* Dashboard Preview */}
        <TabsContent value="preview" className="mt-6 space-y-4">
          {/* Role Switcher */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Dashboard-Vorschau</h3>
              <p className="text-sm text-muted-foreground">
                Sehen Sie, wie das Dashboard für jede Rolle aussieht
              </p>
            </div>
            <div className="flex gap-1">
              {roles.map(role => (
                <Button
                  key={role.role_key}
                  variant={selectedRole === role.role_key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role.role_key)}
                >
                  {role.role_name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Content */}
          <DashboardPreviewContent selectedRole={selectedRole} />
        </TabsContent>

        {/* Compare */}
        <TabsContent value="compare" className="mt-6 space-y-6">
          <RoleComparisonContent roles={roles} allPermissions={allPermissions} />
        </TabsContent>
      </Tabs>

      {/* No Permission Modal */}
      <Dialog open={showNoPermissionModal} onOpenChange={setShowNoPermissionModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-orange-100 rounded-full">
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Keine Berechtigung</DialogTitle>
            <DialogDescription className="text-center">
              Sie haben keine Berechtigung, um auf diesen Bereich zuzugreifen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Badge variant="outline">Aktuelle Rolle: {currentRole?.role_name}</Badge>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setShowNoPermissionModal(false)}>
              Verstanden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}