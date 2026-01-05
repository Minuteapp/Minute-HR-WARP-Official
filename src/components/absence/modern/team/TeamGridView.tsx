import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TeamMember, GroupByOption } from '@/types/team.types';

interface TeamGridViewProps {
  members: TeamMember[];
  groupBy: GroupByOption;
}

export const TeamGridView: React.FC<TeamGridViewProps> = ({ members, groupBy }) => {
  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verfügbar</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Abwesend</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Ausstehend</Badge>;
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupMembers.map(member => (
              <Card key={member.id} className="hover:shadow-md transition-shadow relative">
                <CardContent className="p-6">
                  {/* Status Badge oben rechts */}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(member.status)}
                  </div>

                  {/* Avatar zentral */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className={`h-14 w-14 mb-3 ${getAvatarColor(member.name)} text-white`}>
                      <AvatarFallback className="bg-transparent text-white text-lg">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-base">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.employeeNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {member.department} • {member.location}
                    </p>
                  </div>

                  {/* Statistiken */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Urlaub genommen:</span>
                      <span className="font-medium">{member.vacationDays} Tage</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resturlaub:</span>
                      <span className="font-medium text-green-600">{member.remainingVacation} Tage</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Krankheitstage:</span>
                      <span className="font-medium">{member.sickDays} Tage</span>
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
