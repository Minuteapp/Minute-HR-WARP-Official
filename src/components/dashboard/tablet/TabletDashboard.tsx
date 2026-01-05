import React from 'react';
import { Home, Calendar, ListTodo, MoreHorizontal, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VoiceCommandModal from '@/components/voice/VoiceCommandModal';
import { useTenant } from '@/contexts/TenantContext';
import { useCompany } from '@/contexts/CompanyContext';

const TabletDashboard = () => {
  const navigate = useNavigate();
  const [showVoiceModal, setShowVoiceModal] = React.useState(false);
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  const handleNavigationClick = (path: string) => {
    navigate(path);
  };

  const { dailyWorkHours } = useTimeTracking();
  const formatDaily = () => {
    const h = Math.floor(dailyWorkHours);
    const m = Math.round((dailyWorkHours - h) * 60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  const { data: allEmployees = [] } = useQuery({
    queryKey: ['all-employees-status-mini', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('id, user_id')
        .eq('company_id', effectiveCompanyId)
        .eq('status', 'active')
        .eq('archived', false);
      return data || [];
    }
  });

  const employeeUserIds = (allEmployees || []).map((e: any) => e.user_id).filter(Boolean);

  const { data: absences = { absenceRequests: [], sickLeaves: [] } } = useQuery({
    queryKey: ['current-absences-mini', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return { absenceRequests: [], sickLeaves: [] };
      const today = new Date().toISOString().split('T')[0];
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

      return { absenceRequests: absenceRequests || [], sickLeaves };
    }
  });

  const totalEmployees = allEmployees.length;
  const absentIds = new Set([
    ...((absences as any)?.absenceRequests?.map((r: any) => r.user_id) || []),
    ...((absences as any)?.sickLeaves?.map((s: any) => s.user_id) || [])
  ]);
  const presentCount = Math.max(0, totalEmployees - absentIds.size);

  const { data: todayEvents = [] } = useQuery({
    queryKey: ['dashboard-today-events-count'],
    queryFn: async () => {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const { data } = await supabase
        .from('calendar_events')
        .select('id')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString());
      return data || [];
    }
  });

  const { data: openTasks = [] } = useQuery({
    queryKey: ['dashboard-open-tasks-count'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, status')
        .neq('status', 'deleted');
      return (data || []).filter((t: any) => t.status !== 'done');
    }
  });

  const recruitingCount = 0;
  const quickActionsCount = 3;
  return (
    <div className="flex flex-col h-screen">
      {/* Obere Navbar - Blaues Header mit MINUTE Logo und ALEX Button */}
      <div 
        className="p-6 flex items-center justify-between"
        style={{ backgroundColor: '#2c3ad1' }}
      >
        <div></div>
        <div 
          className="px-12 py-3 text-2xl font-bold"
          style={{ backgroundColor: 'white', color: '#2c3ad1' }}
        >
          MINUTE
        </div>
        <Button 
          onClick={() => setShowVoiceModal(true)}
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50"
          style={{ color: '#2c3ad1' }}
        >
          <Mic className="h-4 w-4 mr-2" />
          ALEX
        </Button>
      </div>

      {/* Hauptinhalt mit Dashboard Widgets */}
      <div 
        className="flex-1 p-6"
        style={{ backgroundColor: '#E8E9F3' }}
      >
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Zeiterfassung Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center mr-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              <span className="text-base font-medium text-gray-700">Zeiterfassung</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{formatDaily()}</div>
                <div className="text-sm text-gray-500 mt-2">Arbeitszeit heute</div>
              </div>
          </div>
          
          {/* Team Status Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span className="text-base font-medium text-gray-700">Team Status</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{presentCount}/{totalEmployees}</div>
                <div className="text-sm text-gray-500 mt-2">Anwesend</div>
              </div>
          </div>
          
          {/* Kalender Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-base font-medium text-gray-700">Kalender</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{todayEvents.length}</div>
                <div className="text-sm text-gray-500 mt-2">Termine heute</div>
              </div>
          </div>
          
          {/* Aufgaben Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <ListTodo className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-base font-medium text-gray-700">Aufgaben</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{openTasks.length}</div>
                <div className="text-sm text-gray-500 mt-2">Offene Aufgaben</div>
              </div>
          </div>
          
          {/* Recruiting Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">+</span>
              </div>
              <span className="text-base font-medium text-gray-700">Recruiting</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{recruitingCount}</div>
                <div className="text-sm text-gray-500 mt-2">Neue Bewerbungen</div>
              </div>
          </div>
          
          {/* Quick Actions Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: '#2c3ad1' }}>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center mr-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full ml-1"></div>
              </div>
              <span className="text-base font-medium text-gray-700">Quick Actions</span>
            </div>
              <div className="text-center mt-12">
                <div className="text-5xl font-bold text-gray-900">{quickActionsCount}</div>
                <div className="text-sm text-gray-500 mt-2">Verfügbare Aktionen</div>
              </div>
          </div>
        </div>
      </div>

      {/* Untere Navbar - Blaue Navigation */}
      <div 
        className="p-6"
        style={{ backgroundColor: '#2c3ad1' }}
      >
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/')}
          >
            <Home size={28} />
            <span className="text-sm mt-2">Home</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/kalender')}
          >
            <Calendar size={28} />
            <span className="text-sm mt-2">Kalender</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/aufgaben')}
          >
            <ListTodo size={28} />
            <span className="text-sm mt-2">Aufgaben</span>
          </div>
          <div 
            className="flex flex-col items-center text-white cursor-pointer"
            onClick={() => handleNavigationClick('/mehr')}
          >
            <MoreHorizontal size={28} />
            <span className="text-sm mt-2">Mehr</span>
          </div>
        </div>
      </div>
      
      <VoiceCommandModal 
        open={showVoiceModal}
        onOpenChange={setShowVoiceModal}
      />
    </div>
  );
};

export default TabletDashboard;