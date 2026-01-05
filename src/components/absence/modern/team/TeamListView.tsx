import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TeamMember, GroupByOption } from '@/types/team.types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TeamListViewProps {
  members: TeamMember[];
  groupBy: GroupByOption;
}

export const TeamListView: React.FC<TeamListViewProps> = ({ members, groupBy }) => {
  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verfügbar</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Abwesend</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Antrag ausstehend</Badge>;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const groupedMembers = React.useMemo(() => {
    if (groupBy === 'none') {
      return [{ group: null, members }];
    }

    const groups = new Map<string, TeamMember[]>();
    members.forEach(member => {
      const key = groupBy === 'department' ? member.department : member.status;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(member);
    });

    return Array.from(groups.entries()).map(([group, members]) => ({ group, members }));
  }, [members, groupBy]);

  return (
    <div className="space-y-6">
      {groupedMembers.map(({ group, members: groupMembers }) => (
        <div key={group || 'all'} className="space-y-3">
          {group && (
            <h3 className="text-lg font-semibold text-foreground">
              {group} ({groupMembers.length})
            </h3>
          )}
          
          <div className="space-y-2">
            {groupMembers.map(member => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className={`h-10 w-10 ${getAvatarColor(member.name)} text-white flex-shrink-0`}>
                      <AvatarFallback className="bg-transparent text-white">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base">{member.name}</h4>
                        <span className="text-sm text-muted-foreground">• {member.employeeNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{member.department}</span>
                        <span>•</span>
                        <span>{member.location}</span>
                        {member.currentAbsence && (
                          <>
                            <Badge className="bg-red-50 text-red-700 hover:bg-red-50 ml-2">
                              {format(member.currentAbsence.startDate, 'dd.MM.', { locale: de })} - {format(member.currentAbsence.endDate, 'dd.MM.yyyy', { locale: de })}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Statistiken */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Urlaub</p>
                        <p className="font-medium">{member.vacationDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Krank</p>
                        <p className="font-medium">{member.sickDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Homeoffice</p>
                        <p className="font-medium">{member.homeofficeDays}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Resturlaub</p>
                        <p className="font-medium text-green-600">{member.remainingVacation}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
