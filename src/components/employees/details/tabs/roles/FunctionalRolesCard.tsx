import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Check } from 'lucide-react';
import type { FunctionalRole } from '@/integrations/supabase/hooks/useEmployeeRoles';

interface FunctionalRolesCardProps {
  roles: FunctionalRole[];
}

export const FunctionalRolesCard = ({ roles }: FunctionalRolesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Aktuelle Rollen & Verantwortlichkeiten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine funktionalen Rollen zugewiesen
            </p>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{role.role_name}</h3>
                    <Badge
                      variant={role.badge_color === 'black' ? 'default' : 'secondary'}
                    >
                      {role.badge_label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {role.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <Switch checked={role.is_active} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {role.responsibilities.map((responsibility, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{responsibility}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
