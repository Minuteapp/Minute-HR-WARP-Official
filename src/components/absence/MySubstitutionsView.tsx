import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Substitution {
  id: string;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  department?: string;
}

export const MySubstitutionsView: React.FC = () => {
  const { user } = useAuth();

  const { data: substitutions, isLoading } = useQuery({
    queryKey: ['my-substitutions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Hole Employee-ID des aktuellen Users
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!employee) return [];

      // Hole alle Abwesenheiten wo ich als Vertretung eingetragen bin
      const { data, error } = await supabase
        .from('absence_requests')
        .select('id, employee_name, type, start_date, end_date, status, department')
        .or(`substitute_id.eq.${employee.id},substitute_user_id.eq.${employee.id}`)
        .eq('status', 'approved')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as Substitution[];
    },
    enabled: !!user?.id
  });

  const activeSubstitutions = substitutions?.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.start_date <= today && s.end_date >= today;
  }) || [];

  const upcomingSubstitutions = substitutions?.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.start_date > today;
  }) || [];

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Urlaub',
      sick: 'Krankheit',
      sick_leave: 'Krankheit',
      personal: 'Persönlich',
      training: 'Fortbildung',
      parental: 'Elternzeit',
      homeoffice: 'Homeoffice',
      business_trip: 'Dienstreise'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Meine Vertretungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aktive Vertretungen */}
        {activeSubstitutions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Aktuell vertrete ich:
            </h4>
            <div className="space-y-2">
              {activeSubstitutions.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {sub.employee_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{sub.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{getTypeLabel(sub.type)}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      bis {format(new Date(sub.end_date), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bevorstehende Vertretungen */}
        {upcomingSubstitutions.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Bevorstehende Vertretungen:
            </h4>
            <div className="space-y-2">
              {upcomingSubstitutions.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {sub.employee_name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{sub.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(sub.start_date), 'dd.MM.', { locale: de })}
                      <ArrowRight className="h-3 w-3 inline mx-1" />
                      {format(new Date(sub.end_date), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keine Vertretungen */}
        {!substitutions || substitutions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine aktiven oder geplanten Vertretungen</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
