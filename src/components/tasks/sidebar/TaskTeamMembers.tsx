
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface TaskTeamMembersProps {
  members: string[];
  onMembersChange: (members: string[]) => void;
}

export const TaskTeamMembers = ({
  members,
  onMembersChange,
}: TaskTeamMembersProps) => {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-for-tasks'],
    queryFn: async () => {
      try {
        console.log('Lade alle Mitarbeiter für Aufgabenzuweisung...');
        
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, name, position, team, department, status')
          .order('last_name');
        
        if (error) {
          console.error('Fehler beim Laden der Mitarbeiter:', error);
          throw error;
        }
        
        const employeesList = data?.map(emp => ({
          id: emp.id,
          name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          role: emp.position || '',
          team: emp.team || '',
          department: emp.department || '',
          status: emp.status || 'active'
        })) || [];
        
        console.log('Alle geladenen Mitarbeiter:', employeesList);
        return employeesList;
      } catch (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
        return [];
      }
    }
  });

  const handleAddMember = (memberId: string) => {
    if (!members.includes(memberId) && memberId) {
      const updatedMembers = [...members, memberId];
      console.log('Mitarbeiter zur Aufgabe hinzugefügt:', memberId);
      onMembersChange(updatedMembers);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = members.filter(id => id !== memberId);
    onMembersChange(updatedMembers);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getMemberById = (id: string) => {
    return employees?.find(member => member.id === id);
  };

  // Mitglieder, die noch nicht zugewiesen sind
  const availableMembers = employees?.filter(
    member => !members.includes(member.id)
  ) || [];

  // Gruppiere Mitarbeiter nach Teams
  const groupedByTeam = availableMembers.reduce((groups: Record<string, typeof availableMembers>, member) => {
    const teamName = member.team || 'Kein Team';
    if (!groups[teamName]) {
      groups[teamName] = [];
    }
    groups[teamName].push(member);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Mitarbeiter werden geladen...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-1">
        <Users className="h-4 w-4 text-[#9b87f5]" />
        Teammitglieder
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {members.length === 0 && (
          <div className="text-xs text-gray-500">Keine Teammitglieder zugewiesen</div>
        )}

        {members.map(memberId => {
          const member = getMemberById(memberId);
          return (
            <div 
              key={memberId}
              className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-gray-300">
                  {member ? getInitials(member.name) : "??"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {member ? member.name : "Unbekannt"}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleRemoveMember(memberId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {availableMembers.length > 0 && (
        <div className="mt-2">
          <Select onValueChange={handleAddMember}>
            <SelectTrigger>
              <SelectValue placeholder="Teammitglied hinzufügen" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedByTeam).map(([teamName, teamMembers]) => (
                <div key={teamName} className="py-1">
                  <div className="px-2 py-1 font-medium text-xs text-muted-foreground bg-muted/50">
                    {teamName}
                  </div>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-gray-300">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        {member.role && (
                          <span className="text-xs text-gray-500">({member.role})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {availableMembers.length === 0 && employees && employees.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Alle verfügbaren Mitarbeiter sind bereits zugewiesen
        </div>
      )}
    </div>
  );
};
