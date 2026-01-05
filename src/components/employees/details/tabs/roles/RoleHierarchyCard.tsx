import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, ArrowDown, ArrowRight } from 'lucide-react';
import type { RoleHierarchy } from '@/integrations/supabase/hooks/useEmployeeRoles';

interface RoleHierarchyCardProps {
  hierarchy?: RoleHierarchy | null;
}

export const RoleHierarchyCard = ({ hierarchy }: RoleHierarchyCardProps) => {
  if (!hierarchy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rollenhierarchie & Vertretungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Keine Hierarchie-Informationen verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Rollenhierarchie & Vertretungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Vorgesetzter */}
          {hierarchy.reports_to_name && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Vorgesetzte Rolle
              </h3>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-purple-50 border-purple-200">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-purple-600 text-white">
                    {hierarchy.reports_to_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{hierarchy.reports_to_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {hierarchy.reports_to_position}
                  </p>
                </div>
              </div>
              <div className="flex justify-center my-2">
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Aktuelle Position */}
          <div className="flex items-center gap-4 p-4 border-2 rounded-lg bg-blue-50 border-blue-300">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-600 text-white">DH</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Ihre Position</p>
              <p className="text-sm text-muted-foreground">Aktuelle Rolle</p>
            </div>
          </div>

          {/* Vertretung durch */}
          {hierarchy.is_substituted_by_name && (
            <>
              <div className="flex justify-center my-2">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Vertretung durch
                </h3>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50 border-green-200">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-green-600 text-white">
                      {hierarchy.is_substituted_by_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{hierarchy.is_substituted_by_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hierarchy.is_substituted_by_position}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vertritt */}
          {hierarchy.substitutes_for_names && hierarchy.substitutes_for_names.length > 0 && (
            <>
              <div className="flex justify-center my-2">
                <ArrowDown className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Vertritt</h3>
                <div className="space-y-2">
                  {hierarchy.substitutes_for_names.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {hierarchy.substitutes_for_positions?.[idx] || 'Position'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
