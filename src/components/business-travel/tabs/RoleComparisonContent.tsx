import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, UserCog, User, Check } from 'lucide-react';

interface TravelRole {
  id: string;
  role_key: string;
  role_name: string;
  description: string;
  color?: string;
  icon?: string;
  main_features?: string[];
}

interface RoleComparisonContentProps {
  roles: TravelRole[];
  allPermissions: any[];
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  shield: <Shield className="h-5 w-5" />,
  'users-cog': <Users className="h-5 w-5" />,
  'user-cog': <UserCog className="h-5 w-5" />,
  user: <User className="h-5 w-5" />
};

const ROLE_ICON_BG: Record<string, string> = {
  violet: 'bg-violet-100 text-violet-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600'
};

const ROLE_COMPARISON_DATA = {
  admin: {
    employees: 'Alle',
    budget: 'Vollzugriff',
    pending: '—',
    permissions: { count: 13, color: 'bg-violet-100 text-violet-700' },
    features: [
      'Vollständiger Zugriff auf alle Module',
      'Benutzerverwaltung',
      'Systemeinstellungen',
      'Alle Genehmigungen erteilen',
      'Richtlinien & Workflows',
      'Integrationen verwalten'
    ]
  },
  hr_admin: {
    employees: 'Alle',
    budget: '—',
    pending: 'Alle',
    permissions: { count: 8, color: 'bg-blue-100 text-blue-700' },
    features: [
      'Alle Mitarbeiter einsehen',
      'Alle Abteilungen verwalten',
      'Alle Anträge genehmigen',
      'Reports & Analytics',
      'Workflow-Management',
      'Batch-Genehmigungen'
    ]
  },
  team_lead: {
    employees: 'Team',
    budget: 'Team-Budget',
    pending: 'Team',
    permissions: { count: 7, color: 'bg-green-100 text-green-700' },
    features: [
      'Team-Mitarbeiter einsehen',
      'Team-Budgets verwalten',
      'Team-Anträge genehmigen',
      'Team-Reports erstellen',
      'Eigene Anträge erstellen',
      'Team-Aktivität verfolgen'
    ]
  },
  employee: {
    employees: '—',
    budget: 'Eigenes',
    pending: 'Eigene',
    permissions: { count: 4, color: 'bg-gray-100 text-gray-700' },
    features: [
      'Eigene Reiseanträge erstellen',
      'Eigene Spesen einreichen',
      'Belege hochladen',
      'Eigenes Budget einsehen',
      'Reisekalender verwalten',
      'Eigene Reports einsehen'
    ]
  }
};

export function RoleComparisonContent({ roles, allPermissions }: RoleComparisonContentProps) {
  // Count permissions per role
  const getPermissionCount = (roleKey: string) => {
    return allPermissions.filter(p => p.role_key === roleKey && p.granted).length;
  };

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div>
        <h3 className="text-lg font-semibold">Rollenvergleich</h3>
        <p className="text-sm text-muted-foreground">
          Vergleichen Sie die Funktionen und Berechtigungen aller Rollen
        </p>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium w-32">Merkmal</th>
                  {roles.map(role => (
                    <th key={role.role_key} className="text-center py-3 font-medium px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`p-1.5 rounded-lg ${ROLE_ICON_BG[role.color || 'violet']}`}>
                          {ROLE_ICONS[role.icon || 'user']}
                        </div>
                        <span className="hidden lg:inline">{role.role_name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 font-medium">Mitarbeiter</td>
                  {roles.map(role => {
                    const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
                    return (
                      <td key={role.role_key} className="text-center py-3 px-4">
                        {data?.employees || '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 font-medium">Budget</td>
                  {roles.map(role => {
                    const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
                    return (
                      <td key={role.role_key} className="text-center py-3 px-4">
                        {data?.budget || '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 font-medium">Ausstehend</td>
                  {roles.map(role => {
                    const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
                    return (
                      <td key={role.role_key} className="text-center py-3 px-4">
                        {data?.pending || '—'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 font-medium">Berechtigungen</td>
                  {roles.map(role => {
                    const count = getPermissionCount(role.role_key);
                    const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
                    return (
                      <td key={role.role_key} className="text-center py-3 px-4">
                        <Badge className={data?.permissions.color || 'bg-gray-100 text-gray-700'}>
                          {count || data?.permissions.count || 0}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-3 font-medium">Hauptfunktionen</td>
                  {roles.map(role => {
                    const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
                    return (
                      <td key={role.role_key} className="text-center py-3 px-4">
                        <span className="font-semibold">{data?.features.length || 6}</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-4">
        {roles.map(role => {
          const data = ROLE_COMPARISON_DATA[role.role_key as keyof typeof ROLE_COMPARISON_DATA];
          const features = role.main_features?.length ? role.main_features : data?.features || [];
          
          return (
            <Card key={role.id} className={`border-2 border-${role.color || 'gray'}-200`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${ROLE_ICON_BG[role.color || 'violet']}`}>
                    {ROLE_ICONS[role.icon || 'user']}
                  </div>
                  <div>
                    <CardTitle className="text-base">{role.role_name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm font-medium mb-3">Hauptfunktionen:</p>
                <div className="space-y-2">
                  {features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className={`p-0.5 rounded-full ${ROLE_ICON_BG[role.color || 'violet']}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}