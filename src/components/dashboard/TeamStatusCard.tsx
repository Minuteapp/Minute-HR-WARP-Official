import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTenant } from "@/contexts/TenantContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

const TeamStatusCard = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;
  
  // Lade alle aktiven Mitarbeiter mit Details
  const { data: allEmployees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['all-employees-status', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return [];

      const { data } = await supabase
        .from('employees')
        .select('id, user_id, first_name, last_name, position, status')
        .eq('company_id', effectiveCompanyId)
        .eq('status', 'active')
        .eq('archived', false)
        .limit(50);
      return data || [];
    }
  });

  const employeeUserIds = allEmployees.map((e: any) => e.user_id).filter(Boolean);

  // Lade aktuelle Abwesenheiten
  const { data: currentAbsences, isLoading: absencesLoading } = useQuery({
    queryKey: ['current-absences', effectiveCompanyId],
    enabled: !!effectiveCompanyId && !employeesLoading,
    queryFn: async () => {
      if (!effectiveCompanyId) {
        return { absenceRequests: [], sickLeaves: [] };
      }

      const today = new Date().toISOString().split('T')[0];
      
      // Prüfe genehmigte Abwesenheitsanträge für heute
      const { data: absenceRequests } = await supabase
        .from('absence_requests')
        .select('user_id, type, employee_name')
        .eq('status', 'approved')
        .eq('company_id', effectiveCompanyId)
        .lte('start_date', today)
        .gte('end_date', today);

      // Prüfe aktuelle Krankmeldungen
      let sickLeaves: any[] = [];
      if (employeeUserIds.length > 0) {
        const { data } = await supabase
          .from('sick_leaves')
          .select('user_id, employee_name')
          .eq('status', 'active')
          .lte('start_date', today)
          .gte('end_date', today)
          .in('user_id', employeeUserIds);

        sickLeaves = data || [];
      }

      return {
        absenceRequests: absenceRequests || [],
        sickLeaves
      };
    }
  });

  // Lade aktuelle Zeiterfassungen (wer ist heute eingecheckt)
  const { data: timeEntriesToday = [] } = useQuery({
    queryKey: ['time-entries-today', effectiveCompanyId],
    enabled: !!effectiveCompanyId && employeeUserIds.length > 0,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('time_entries')
        .select('user_id, clock_in, clock_out, break_start, break_end')
        .gte('date', today)
        .lte('date', today)
        .in('user_id', employeeUserIds);
      
      return data || [];
    }
  });

  // Lade stündliche Aktivitätsdaten für das Chart
  const { data: hourlyActivityData = [] } = useQuery({
    queryKey: ['hourly-activity', effectiveCompanyId],
    enabled: !!effectiveCompanyId && employeeUserIds.length > 0,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('time_entries')
        .select('clock_in, clock_out')
        .gte('date', today)
        .lte('date', today)
        .in('user_id', employeeUserIds);
      
      // Berechne Aktivität pro Stunde (9-17 Uhr)
      const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
      const currentHour = new Date().getHours();
      
      return hours.map(timeStr => {
        const hour = parseInt(timeStr.split(':')[0]);
        
        // Nur Daten für vergangene Stunden anzeigen
        if (hour > currentHour) {
          return { time: timeStr, active: 0 };
        }
        
        // Zähle Mitarbeiter die zu dieser Stunde aktiv waren
        const activeCount = (data || []).filter((entry: any) => {
          if (!entry.clock_in) return false;
          const clockInHour = new Date(entry.clock_in).getHours();
          const clockOutHour = entry.clock_out ? new Date(entry.clock_out).getHours() : currentHour;
          return clockInHour <= hour && clockOutHour >= hour;
        }).length;
        
        return { time: timeStr, active: activeCount };
      });
    }
  });

  const handleCardClick = () => {
    navigate('/absence');
  };

  if (employeesLoading || absencesLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  // Berechne Anwesenheitsstatus
  const totalEmployees = allEmployees.length;
  
  // Erstelle Set der abwesenden Mitarbeiter-IDs
  const absentEmployeeIds = new Set([
    ...(currentAbsences?.absenceRequests?.map(req => req.user_id) || []),
    ...(currentAbsences?.sickLeaves?.map(sick => sick.user_id) || [])
  ]);

  // Berechne Pause und Meeting aus echten Daten
  const onBreak = timeEntriesToday.filter((entry: any) => 
    entry.break_start && !entry.break_end
  );
  const pauseCount = onBreak.length;
  
  // Meeting-Status müsste aus calendar_events kommen - für jetzt 0 wenn keine Daten
  const meetingCount = 0;
  
  // Anwesende = eingecheckt und nicht ausgecheckt
  const checkedIn = timeEntriesToday.filter((entry: any) => 
    entry.clock_in && !entry.clock_out && !entry.break_start
  );
  
  // Anwesende Mitarbeiter = Alle - Abwesende
  const presentCount = Math.max(0, totalEmployees - absentEmployeeIds.size);
  const activeCount = checkedIn.length + pauseCount;

  // Nutze echte stündliche Aktivitätsdaten
  const activityData = hourlyActivityData.length > 0 ? hourlyActivityData : [
    { time: '09:00', active: 0 },
    { time: '10:00', active: 0 },
    { time: '11:00', active: 0 },
    { time: '12:00', active: 0 },
    { time: '13:00', active: 0 },
    { time: '14:00', active: 0 },
    { time: '15:00', active: 0 },
    { time: '16:00', active: 0 },
  ];

  // Echte Teammitglieder mit Status
  const teamMembers = allEmployees.slice(0, 4).map((emp: any) => {
    const isAbsent = absentEmployeeIds.has(emp.user_id);
    const isOnBreak = onBreak.some((entry: any) => entry.user_id === emp.user_id);
    
    let status = 'aktiv';
    if (isAbsent) status = 'abwesend';
    else if (isOnBreak) status = 'pause';
    
    return {
      id: emp.id,
      name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
      position: emp.position || 'Mitarbeiter',
      initial: (emp.first_name?.[0] || emp.last_name?.[0] || 'U').toUpperCase(),
      status
    };
  });

  return (
    <Card className="p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Team Status</h2>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-xs">
          {presentCount}/{totalEmployees} Anwesend
        </Badge>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold mb-0.5">{presentCount}</div>
          <div className="text-xs text-gray-600">Anwesend</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold mb-0.5">{pauseCount}</div>
          <div className="text-xs text-gray-600">Pause</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-3xl font-bold mb-0.5">{absentEmployeeIds.size}</div>
          <div className="text-xs text-gray-600">Abwesend</div>
        </div>
      </div>

      {/* Team Activity Chart */}
      {totalEmployees > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Team Aktivität (Heute)</h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                domain={[0, totalEmployees]}
              />
              <Line 
                type="monotone" 
                dataKey="active" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Team Members List */}
      {teamMembers.length > 0 ? (
        <div className="space-y-2 mb-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-blue-100">
                  <AvatarFallback className="text-xs font-medium text-blue-700">
                    {member.initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold">{member.name}</p>
                  <p className="text-[10px] text-gray-500">{member.position}</p>
                </div>
              </div>
              <Badge 
                className={`text-[10px] px-2 py-0.5 ${
                  member.status === 'aktiv'
                    ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'
                    : member.status === 'pause'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
                }`}
              >
                {member.status}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground mb-3">
          Keine Mitarbeiter gefunden
        </div>
      )}

      {/* All Team Members Button */}
      <Button 
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 h-9 text-sm"
        onClick={handleCardClick}
      >
        Alle Teammitglieder
      </Button>
    </Card>
  );
};

export default TeamStatusCard;
