import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  department: string | null;
  position: string | null;
}

interface TimeEntry {
  user_id: string;
  start_time: string;
  end_time: string | null;
}

interface TeamStatus {
  member: TeamMember;
  isActive: boolean;
  currentProject?: string;
}

export const TeamStatusWidget: React.FC = () => {
  const [teamStatus, setTeamStatus] = useState<TeamStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamStatus = async () => {
      try {
        // Lade Team-Mitglieder
        const { data: members, error: membersError } = await supabase
          .from('employees')
          .select('*')
          .eq('status', 'active')
          .limit(8);

        if (membersError) throw membersError;

        // Lade aktuelle Zeiteinträge
        const today = new Date().toISOString().split('T')[0];
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select('user_id, start_time, end_time, project')
          .gte('start_time', `${today}T00:00:00.000Z`)
          .is('end_time', null);

        if (timeError) throw timeError;

        // Kombiniere Daten
        const status: TeamStatus[] = (members || []).map(member => {
          const activeEntry = timeEntries?.find(entry => entry.user_id === member.id);
          return {
            member,
            isActive: !!activeEntry,
            currentProject: activeEntry?.project || undefined
          };
        });

        setTeamStatus(status);
      } catch (error) {
        console.error('Fehler beim Laden des Team-Status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStatus();
  }, []);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-500' : 'text-gray-400';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Anwesend' : 'Abwesend';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCount = teamStatus.filter(s => s.isActive).length;
  const totalCount = teamStatus.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Status ({activeCount}/{totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {teamStatus.length === 0 ? (
          <p className="text-muted-foreground text-sm">Keine Team-Mitglieder gefunden</p>
        ) : (
          teamStatus.map((status) => (
            <div key={status.member.id} className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Circle className={`h-2 w-2 fill-current ${getStatusColor(status.isActive)}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {status.member.first_name && status.member.last_name 
                      ? `${status.member.first_name} ${status.member.last_name}`
                      : status.member.name
                    }
                  </p>
                  {status.member.department && (
                    <p className="text-xs text-muted-foreground truncate">
                      {status.member.department}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={status.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getStatusText(status.isActive)}
                </Badge>
                {status.currentProject && (
                  <span className="text-xs text-muted-foreground">
                    {status.currentProject}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};