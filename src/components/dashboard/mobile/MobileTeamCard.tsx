import { Users, TrendingUp, MoreVertical, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useCompany } from '@/contexts/CompanyContext';

const MobileTeamCard = () => {
  const navigate = useNavigate();
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  const { data: allEmployees, isLoading } = useQuery({
    queryKey: ['all-employees-status', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      if (!effectiveCompanyId) return [];
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .eq('status', 'active')
        .eq('archived', false);
      return data || [];
    }
  });

  const employeeUserIds = (allEmployees || []).map((e: any) => e.user_id).filter(Boolean);

  const { data: currentAbsences } = useQuery({
    queryKey: ['current-absences', effectiveCompanyId],
    enabled: !!effectiveCompanyId && !isLoading,
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

  if (isLoading) return <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/80"><div className="text-gray-500 text-xs">Lädt...</div></div>;

  const totalEmployees = allEmployees?.length || 0;
  const absentEmployeeIds = new Set([
    ...(currentAbsences?.absenceRequests?.map((req: any) => req.user_id) || []),
    ...(currentAbsences?.sickLeaves?.map((sick: any) => sick.user_id) || [])
  ]);
  const presentCount = Math.max(0, totalEmployees - absentEmployeeIds.size);
  const presentPercentage = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;
  const absentCount = absentEmployeeIds.size;
  const homeOfficeCount = presentCount > 0 ? Math.ceil(presentCount * 0.25) : 0;
  const officeCount = Math.max(0, presentCount - homeOfficeCount);


  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/80 cursor-pointer hover:shadow-xl hover:border-white transition-all h-full flex flex-col"
      onClick={() => navigate('/employees')}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c3ad1] bg-[#2c3ad1]/10 flex items-center justify-center flex-shrink-0">
          <Users className="h-4 w-4 text-[#2c3ad1]" />
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <span className="text-[9px] font-semibold text-green-500">Online</span>
          <TrendingUp className="h-2.5 w-2.5 text-green-500" />
          <span className="text-[9px] text-green-500">{presentPercentage}%</span>
        </div>
        <MoreVertical className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </div>

      <h3 className="text-[11px] font-bold text-gray-700 mb-0.5 leading-tight">Team</h3>
      <div className="text-2xl font-bold text-gray-900 mb-0.5 leading-tight">{presentCount}/{totalEmployees}</div>
      <p className="text-[9px] text-gray-500 mb-2 leading-tight">{absentCount} Mitglieder abwesend</p>

      {/* Avatar bubbles */}
      <div className="flex items-center gap-0.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#8B7EFF] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">A</div>
        <div className="w-6 h-6 rounded-full bg-[#8B7EFF] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">M</div>
        <div className="w-6 h-6 rounded-full bg-[#8B7EFF] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">L</div>
        <div className="w-6 h-6 rounded-full bg-[#8B7EFF] flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">T</div>
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[8px] font-medium">+{absentCount}</div>
      </div>

      {/* Status breakdown */}
      <div className="space-y-0.5 mb-2 text-[9px] leading-tight flex-grow">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <span>{officeCount} im Büro</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>{homeOfficeCount} Home Office</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          <span>{absentCount} Krank/Urlaub</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[9px] text-gray-400 mt-auto">
        <span className="flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          vor 5m
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export default MobileTeamCard;
