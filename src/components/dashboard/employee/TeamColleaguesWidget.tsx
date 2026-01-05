import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const TeamColleaguesWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: colleagues = [], isLoading } = useQuery({
    queryKey: ['employee-team-colleagues', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return [];

      // Finde Employee-ID für den aktuellen User
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!employee) return [];

      // Finde Teams des aktuellen Users
      const { data: myTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('company_id', companyId);

      if (!myTeams || myTeams.length === 0) return [];

      const teamIds = myTeams.map(t => t.team_id);

      // Finde andere Team-Mitglieder
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('company_id', companyId)
        .in('team_id', teamIds)
        .neq('user_id', user.id)
        .limit(10);

      if (!teamMembers || teamMembers.length === 0) return [];

      // Unique user IDs
      const uniqueUserIds = [...new Set(teamMembers.map(m => m.user_id))].slice(0, 5);

      // Lade Employee-Details für diese User
      const { data: employeeDetails } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .eq('company_id', companyId)
        .in('user_id', uniqueUserIds);

      return (employeeDetails || []).map(emp => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
        initials: `${(emp.first_name?.[0] || '').toUpperCase()}${(emp.last_name?.[0] || '').toUpperCase()}` || '??',
        role: emp.position || 'Mitarbeiter'
      }));
    },
    enabled: !!companyId
  });

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-600" />
          Team-Kollegen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : colleagues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <UserCircle className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs">Keine Team-Kollegen gefunden</p>
          </div>
        ) : (
          <>
            <div className="text-[10px] text-muted-foreground">
              {colleagues.length} Kollege{colleagues.length !== 1 ? 'n' : ''} im Team
            </div>

            <div className="space-y-2">
              {colleagues.map((colleague) => (
                <div key={colleague.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                      {colleague.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{colleague.name}</p>
                    <p className="text-[10px] text-muted-foreground">{colleague.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
