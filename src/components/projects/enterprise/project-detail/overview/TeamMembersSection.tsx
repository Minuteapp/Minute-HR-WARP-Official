
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamMembersSectionProps {
  projectId: string;
}

export const TeamMembersSection = ({ projectId }: TeamMembersSectionProps) => {
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project-team-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_team_members')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  };

  if (teamMembers.length === 0) {
    return (
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Team-Mitglieder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keine Team-Mitglieder zugewiesen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Team-Mitglieder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {teamMembers.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                  {getInitials(member.name || 'NN')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{member.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
