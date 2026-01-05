import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Calendar, 
  CheckSquare, 
  UserPlus, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  Loader2
} from 'lucide-react';
import {
  useWeeklyTimeTracking,
  useTeamStatus,
  useTodayAppointments,
  useOpenTasks,
  useOpenPositions,
  useGoalsProgress
} from '@/hooks/dashboard/useDashboardData';

interface CardProps {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: { text: string; color: string; outlined?: boolean };
  trend?: { text: string; color: string; direction?: 'up' | 'down' };
  title: string;
  value: string;
  subtitle: string;
  progress?: { label: string; value: number; current: number; total: number };
  list?: string[];
  timestamp: string;
  route?: string;
  isLoading?: boolean;
}

const DashboardCard: React.FC<CardProps> = ({
  icon,
  iconBg,
  badge,
  trend,
  title,
  value,
  subtitle,
  progress,
  list,
  timestamp,
  route,
  isLoading
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) navigate(route);
  };

  return (
    <div 
      className="bg-card rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col border border-border/50"
      onClick={handleClick}
    >
      {/* Header mit Icon, Badges und Dots */}
      <div className="flex items-start justify-between mb-2">
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <div className="flex gap-1.5 items-center flex-shrink-0">
          {badge && (
            <span 
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                badge.outlined 
                  ? 'border bg-transparent' 
                  : ''
              }`}
              style={{ 
                backgroundColor: badge.outlined ? 'transparent' : `${badge.color}20`,
                borderColor: badge.outlined ? badge.color : 'transparent',
                color: badge.color 
              }}
            >
              {badge.text}
            </span>
          )}
          
          {trend && (
            <div className="flex items-center gap-0.5" style={{ color: trend.color }}>
              {trend.direction === 'down' ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
              <span className="text-[11px] font-semibold">{trend.text}</span>
            </div>
          )}
        </div>
        
        <div className="h-4 w-4 flex-shrink-0 ml-1">
          <svg className="text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-[13px] font-bold text-foreground mb-1">{title}</h3>
      <div className="text-2xl font-bold text-foreground mb-1">
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : value}
      </div>
      <p className="text-[11px] text-muted-foreground mb-2">{subtitle}</p>

      {/* Progress Bar */}
      {progress && !isLoading && (
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{progress.label}</span>
            <span className="font-semibold text-foreground">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${Math.min(progress.value, 100)}%`,
                backgroundColor: iconBg 
              }}
            />
          </div>
        </div>
      )}

      {/* List Items */}
      {list && list.length > 0 && !isLoading && (
        <div className="space-y-1 mb-2 text-[11px] text-foreground flex-grow">
          {list.map((item, idx) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground mt-auto">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timestamp}
        </span>
        <span>→</span>
      </div>
    </div>
  );
};

export const MobileMinuteCards: React.FC = () => {
  const { data: timeData, isLoading: timeLoading } = useWeeklyTimeTracking();
  const { data: teamData, isLoading: teamLoading } = useTeamStatus();
  const { data: appointmentData, isLoading: appointmentLoading } = useTodayAppointments();
  const { data: taskData, isLoading: taskLoading } = useOpenTasks();
  const { data: recruitingData, isLoading: recruitingLoading } = useOpenPositions();
  const { data: goalsData, isLoading: goalsLoading } = useGoalsProgress();

  const cards: CardProps[] = [
    {
      id: 'time-tracking',
      icon: <Clock className="w-4 h-4" />,
      iconBg: '#8B5CF6',
      trend: timeData?.trend !== 0 ? { 
        text: `${timeData?.trend > 0 ? '+' : ''}${timeData?.trend || 0}%`, 
        color: (timeData?.trend || 0) >= 0 ? '#10B981' : '#EF4444',
        direction: (timeData?.trend || 0) >= 0 ? 'up' : 'down'
      } : undefined,
      title: 'Zeiterfassung',
      value: `${timeData?.hours || 0}h`,
      subtitle: 'Diese Woche',
      progress: { 
        label: 'Wöchentliches Ziel', 
        value: ((timeData?.hours || 0) / (timeData?.target || 40)) * 100, 
        current: timeData?.hours || 0, 
        total: timeData?.target || 40 
      },
      timestamp: 'Live',
      route: '/time-tracking',
      isLoading: timeLoading
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      iconBg: '#3B82F6',
      title: 'Analytics',
      value: '→',
      subtitle: 'Berichte & Statistiken',
      list: ['• Produktivität', '• Team-Performance', '• Zeitauswertungen'],
      timestamp: 'Immer aktuell',
      route: '/analytics'
    },
    {
      id: 'team',
      icon: <Users className="w-4 h-4" />,
      iconBg: '#EC4899',
      badge: { text: `${teamData?.online || 0}/${teamData?.total || 0}`, color: '#3B82F6' },
      title: 'Team',
      value: teamData?.total ? `${Math.round((teamData.online / teamData.total) * 100)}%` : '0%',
      subtitle: 'Online',
      list: teamData?.total ? [
        teamData.homeOffice > 0 ? `• ${teamData.homeOffice} Home Office` : null,
        teamData.office > 0 ? `• ${teamData.office} im Büro` : null,
        teamData.away > 0 ? `• ${teamData.away} unterwegs` : null
      ].filter(Boolean) as string[] : [],
      timestamp: 'Live',
      route: '/team',
      isLoading: teamLoading
    },
    {
      id: 'appointments',
      icon: <Calendar className="w-4 h-4" />,
      iconBg: '#F59E0B',
      badge: { text: 'Heute', color: '#F59E0B' },
      title: 'Termine',
      value: String(appointmentData?.count || 0),
      subtitle: appointmentData?.next ? `Nächster: ${appointmentData.next}` : 'Keine weiteren Termine',
      list: appointmentData?.appointments?.length ? [
        ...appointmentData.appointments.slice(0, 2).map(a => `• ${a}`),
        appointmentData.count > 2 ? `+${appointmentData.count - 2} weitere` : null
      ].filter(Boolean) as string[] : [],
      timestamp: 'Live',
      route: '/calendar',
      isLoading: appointmentLoading
    },
    {
      id: 'tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      iconBg: '#6366F1',
      trend: taskData?.completed ? { text: `${taskData.completed} erledigt`, color: '#10B981' } : undefined,
      title: 'Aufgaben',
      value: String(taskData?.open || 0),
      subtitle: 'Offene Aufgaben',
      progress: taskData?.total ? { 
        label: '', 
        value: (taskData.completed / taskData.total) * 100, 
        current: taskData.open, 
        total: taskData.total 
      } : undefined,
      list: taskData?.open ? [
        taskData.urgent > 0 ? `• ${taskData.urgent} Dringend` : null,
        taskData.normal > 0 ? `• ${taskData.normal} Normal` : null
      ].filter(Boolean) as string[] : [],
      timestamp: 'Live',
      route: '/tasks',
      isLoading: taskLoading
    },
    {
      id: 'recruiting',
      icon: <UserPlus className="w-4 h-4" />,
      iconBg: '#F59E0B',
      badge: recruitingData?.count ? { text: 'Aktiv', color: '#10B981' } : undefined,
      title: 'Recruiting',
      value: String(recruitingData?.count || 0),
      subtitle: 'Offene Stellen',
      list: recruitingData?.positions?.length ? [
        ...recruitingData.positions.slice(0, 2).map(p => `• ${p}`),
        recruitingData.count > 2 ? `+${recruitingData.count - 2} weitere` : null
      ].filter(Boolean) as string[] : [],
      timestamp: 'Live',
      route: '/recruiting',
      isLoading: recruitingLoading
    },
    {
      id: 'quick-actions',
      icon: <Zap className="w-4 h-4" />,
      iconBg: '#10B981',
      badge: { text: 'Shortcuts', color: '#10B981', outlined: true },
      title: 'Quick Actions',
      value: '→',
      subtitle: 'Schnellzugriff',
      list: ['• Urlaub beantragen', '• Spesen erfassen', '• Zeit stempeln'],
      timestamp: 'Immer verfügbar',
      route: '/quick-actions'
    },
    {
      id: 'goals',
      icon: <Target className="w-4 h-4" />,
      iconBg: '#8B5CF6',
      trend: goalsData?.progress ? { 
        text: `${goalsData.progress}%`, 
        color: goalsData.progress >= 50 ? '#10B981' : '#F59E0B' 
      } : undefined,
      title: 'Ziele',
      value: `${goalsData?.progress || 0}%`,
      subtitle: 'Quartalsfortschritt',
      progress: { 
        label: 'Fortschritt', 
        value: goalsData?.progress || 0, 
        current: goalsData?.progress || 0, 
        total: 100 
      },
      list: goalsData?.total ? [
        goalsData.achieved > 0 ? `• ${goalsData.achieved} erreicht` : null,
        goalsData.inProgress > 0 ? `• ${goalsData.inProgress} in Arbeit` : null
      ].filter(Boolean) as string[] : [],
      timestamp: 'Live',
      route: '/goals',
      isLoading: goalsLoading
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <DashboardCard key={card.id} {...card} />
      ))}
    </div>
  );
};
