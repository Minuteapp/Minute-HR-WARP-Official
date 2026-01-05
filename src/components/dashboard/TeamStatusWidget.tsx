import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Users, Clock, MapPin, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMemberStatus {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  status: 'present' | 'absent' | 'vacation' | 'sick' | 'business_trip';
  position?: string;
  department?: string;
  last_seen?: string;
  location?: string;
}

interface TeamStatusData {
  present: TeamMemberStatus[];
  vacation: TeamMemberStatus[];
  sick: TeamMemberStatus[];
  businessTrip: TeamMemberStatus[];
  total: number;
  recentlyActive: TeamMemberStatus[];
}

interface TeamStatusWidgetProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const TeamStatusWidget = ({ darkMode, onToggleVisibility }: TeamStatusWidgetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  const { data: teamStatus } = useQuery({
    queryKey: ['teamStatus', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) {
        return {
          present: [],
          vacation: [],
          sick: [],
          businessTrip: [],
          total: 0,
          recentlyActive: []
        } as TeamStatusData;
      }

      const today = new Date().toISOString().split('T')[0];

      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .eq('status', 'active')
        .eq('archived', false);

      const employeeRows: any[] = employees || [];
      const employeeUserIds = employeeRows.map((e) => e.user_id).filter(Boolean);

      const { data: absenceRequests } = await supabase
        .from('absence_requests')
        .select('user_id, type')
        .eq('status', 'approved')
        .eq('company_id', effectiveCompanyId)
        .lte('start_date', today)
        .gte('end_date', today);

      let sickLeaves: any[] = [];
      if (employeeUserIds.length > 0) {
        const { data } = await supabase
          .from('sick_leaves')
          .select('user_id')
          .eq('status', 'active')
          .lte('start_date', today)
          .gte('end_date', today)
          .in('user_id', employeeUserIds);

        sickLeaves = data || [];
      }

      const sickIds = new Set((sickLeaves || []).map((s: any) => s.user_id));
      const businessTripIds = new Set(
        (absenceRequests || [])
          .filter((r: any) => r.type === 'business_trip')
          .map((r: any) => r.user_id)
      );
      const vacationIds = new Set(
        (absenceRequests || [])
          .filter((r: any) => r.type !== 'business_trip')
          .map((r: any) => r.user_id)
      );

      const toMember = (e: any, status: TeamMemberStatus['status']): TeamMemberStatus => {
        const fullName = String(e.name || '').trim();
        const parts = fullName ? fullName.split(' ') : [];
        const firstName = e.first_name ?? parts[0] ?? '—';
        const lastName = e.last_name ?? (parts.length > 1 ? parts.slice(1).join(' ') : '—');

        return {
          id: e.id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: e.avatar_url ?? undefined,
          status,
          position: e.position ?? undefined,
          department: e.department ?? undefined,
          last_seen: '—',
          location: e.location ?? undefined
        };
      };

      const present: TeamMemberStatus[] = [];
      const vacation: TeamMemberStatus[] = [];
      const sick: TeamMemberStatus[] = [];
      const businessTrip: TeamMemberStatus[] = [];

      for (const e of employeeRows) {
        const uid = e.user_id;
        if (uid && sickIds.has(uid)) {
          sick.push(toMember(e, 'sick'));
        } else if (uid && businessTripIds.has(uid)) {
          businessTrip.push(toMember(e, 'business_trip'));
        } else if (uid && vacationIds.has(uid)) {
          vacation.push(toMember(e, 'vacation'));
        } else {
          present.push(toMember(e, 'present'));
        }
      }

      const recentlyActive = present.slice(0, 3).map((m) => ({ ...m, last_seen: '5 Minuten' }));

      return {
        present,
        vacation,
        sick,
        businessTrip,
        total: employeeRows.length,
        recentlyActive
      } as TeamStatusData;
    },
    refetchInterval: 30000,
  });

  const getStatusIcon = (status: TeamMemberStatus['status']) => {
    switch(status) {
      case 'present': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'vacation': return <Briefcase className="h-3 w-3 text-blue-600" />;
      case 'sick': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'business_trip': return <MapPin className="h-3 w-3 text-orange-600" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusText = (status: TeamMemberStatus['status']) => {
    switch(status) {
      case 'present': return 'Anwesend';
      case 'vacation': return 'Urlaub';
      case 'sick': return 'Krank';
      case 'business_trip': return 'Geschäftsreise';
      default: return 'Unbekannt';
    }
  };

  const getStatusColor = (status: TeamMemberStatus['status']) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'vacation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick': return 'bg-red-100 text-red-800 border-red-200';
      case 'business_trip': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!teamStatus) {
    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden`}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Lädt Team-Status...</div>
        </CardContent>
      </Card>
    );
  }

  const presentCount = teamStatus.present.length;
  const vacationCount = teamStatus.vacation.length;
  const sickCount = teamStatus.sick.length;
  const businessTripCount = teamStatus.businessTrip.length;
  const totalCount = teamStatus.total;
  const presentPercentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

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
              Alle Mitarbeiter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Widget ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {presentPercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">anwesend</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-medium">Anwesend</span>
            </div>
            <div className="text-lg font-bold">{presentCount}</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Briefcase className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium">Urlaub</span>
            </div>
            <div className="text-lg font-bold">{vacationCount}</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-medium">Krank</span>
            </div>
            <div className="text-lg font-bold">{sickCount}</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium">Reise</span>
            </div>
            <div className="text-lg font-bold">{businessTripCount}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Kürzlich aktiv</h4>
          {teamStatus.recentlyActive.map((member) => (
            <div
              key={member.id}
              className={`p-2 rounded-md flex items-center gap-3 cursor-pointer transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => navigate(`/employees/${member.id}`)}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                  <AvatarFallback className="text-xs">
                    {member.first_name?.[0]}{member.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5">
                  {getStatusIcon(member.status)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {member.first_name} {member.last_name}
                </div>
                <div className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="h-3 w-3" />
                  <span>vor {member.last_seen}</span>
                </div>
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(member.status)}`}
              >
                {getStatusText(member.status)}
              </Badge>
            </div>
          ))}
        </div>

        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/employees')}
        >
          Alle anzeigen
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamStatusWidget;
