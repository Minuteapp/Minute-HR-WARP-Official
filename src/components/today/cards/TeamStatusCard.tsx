
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamStatusCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'vacation' | 'sick' | 'meeting';
  position?: string;
  department?: string;
}

const TeamStatusCard = ({ darkMode, onToggleVisibility }: TeamStatusCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: userInfo } = useQuery({
    queryKey: ['user-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('is_manager, department')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user
  });
  
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', userInfo?.department],
    queryFn: async () => {
      if (!userInfo?.department) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, status, position')
        .eq('department', userInfo.department)
        .neq('id', user?.id);
      return data || [];
    },
    enabled: !!userInfo?.department && !!userInfo?.is_manager
  });
  
  // Wenn der Benutzer kein Manager ist, zeigen wir diese Karte nicht an
  if (!userInfo?.is_manager) {
    return null;
  }
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'online': return 'Anwesend';
      case 'offline': return 'Nicht verfügbar';
      case 'vacation': return 'Urlaub';
      case 'sick': return 'Krank';
      case 'meeting': return 'Meeting';
      default: return 'Unbekannt';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-500';
      case 'vacation': return 'bg-blue-500';
      case 'sick': return 'bg-red-500';
      case 'meeting': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  const onlineCount = teamMembers.filter(m => m.status === 'online').length;
  
  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden transition-all duration-300 hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Users className="h-5 w-5 text-primary" />
          Team-Status
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/employees')}>
              Zum Team
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full bg-green-500`}></span>
            <span>{onlineCount} von {teamMembers.length} Mitarbeiter:innen anwesend</span>
          </p>
        </div>
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div
                key={member.id}
                className={`p-3 rounded-md flex items-center gap-3 cursor-pointer transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => navigate(`/employees/${member.id}`)}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                    <AvatarFallback>
                      {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">
                    {member.first_name} {member.last_name}
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {member.position || 'Teammitglied'}
                  </p>
                </div>
                
                <Badge 
                  variant={member.status === 'online' ? 'default' : 'outline'}
                  className={`${
                    member.status === 'online' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300'
                      : member.status === 'sick'
                        ? 'border-red-500 text-red-700 dark:border-red-700 dark:text-red-400'
                        : member.status === 'vacation'
                          ? 'border-blue-500 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                          : ''
                  }`}
                >
                  {getStatusText(member.status)}
                </Badge>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine Teammitglieder gefunden
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/employees')}
        >
          Team verwalten
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TeamStatusCard;
