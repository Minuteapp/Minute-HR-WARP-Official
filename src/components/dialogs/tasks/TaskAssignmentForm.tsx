import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Users, X, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaskAssignmentFormProps {
  assignedTo: string[];
  setAssignedTo: (assignedTo: string[]) => void;
}

export const TaskAssignmentForm = ({
  assignedTo,
  setAssignedTo
}: TaskAssignmentFormProps) => {
  // Echte Mitarbeiter aus der Datenbank laden
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['employees-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .eq('status', 'active')
        .order('last_name');
      
      if (error) throw error;
      return (data || []).map(emp => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
        role: emp.position || 'Mitarbeiter'
      }));
    }
  });

  const handleAssignUser = (userId: string) => {
    if (!assignedTo.includes(userId)) {
      setAssignedTo([...assignedTo, userId]);
    }
  };

  const handleUnassignUser = (userId: string) => {
    setAssignedTo(assignedTo.filter(id => id !== userId));
  };

  const getAssignedUser = (userId: string) => {
    return teamMembers.find(member => member.id === userId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Lade Mitarbeiter...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Zugewiesene Personen
        </Label>
        
        {assignedTo.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignedTo.map(userId => {
              const user = getAssignedUser(userId);
              return user ? (
                <Badge key={userId} variant="outline" className="bg-primary text-primary-foreground">
                  <Avatar className="h-4 w-4 mr-2">
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {user.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => handleUnassignUser(userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Keine Personen zugewiesen</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Verfügbare Teammitglieder</Label>
        {teamMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Mitarbeiter gefunden</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {teamMembers.map(member => (
              <Button
                key={member.id}
                type="button"
                variant="outline"
                className={`justify-start h-auto p-3 ${
                  assignedTo.includes(member.id) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={() => 
                  assignedTo.includes(member.id) 
                    ? handleUnassignUser(member.id)
                    : handleAssignUser(member.id)
                }
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs opacity-70">{member.role}</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
