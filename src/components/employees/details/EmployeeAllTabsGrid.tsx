import { 
  Star, User, UserCircle, Briefcase, FileText, DollarSign,
  Calendar, Clock, TrendingUp, Activity, Home, Target,
  MessageSquare, GraduationCap, CheckCircle, CheckSquare,
  Gift, Shield, Receipt, Trophy, ClipboardList, Settings,
  Heart, Plane, Car, Leaf, Users, Bell, UserX, Laptop,
  FileSignature, AlertTriangle, KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffectiveRole } from '@/hooks/useEffectiveRole';

interface TabItem {
  id: string;
  label: string;
  icon: any;
  requiresRole?: ('admin' | 'hr_admin' | 'manager')[];
  /** Wenn true, ist der Tab auch für Mitarbeiter im eigenen Profil sichtbar */
  allowOwnProfile?: boolean;
}

interface EmployeeAllTabsGridProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
}

export const EmployeeAllTabsGrid = ({ 
  currentTab, 
  onTabChange,
  isOwnProfile = false
}: EmployeeAllTabsGridProps) => {
  const { isAdmin, isHROrAdmin, isTeamleadOrHigher } = useEffectiveRole();
  
  // Prüft ob der aktuelle Benutzer die erforderliche Rolle hat
  const hasRequiredRole = (requiredRoles?: ('admin' | 'hr_admin' | 'manager')[], allowOwnProfile?: boolean) => {
    // Wenn eigenes Profil und Tab erlaubt eigenes Profil: immer anzeigen
    if (isOwnProfile && allowOwnProfile) return true;
    
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'hr_admin') return isHROrAdmin;
      if (role === 'manager') return isTeamleadOrHigher;
      return false;
    });
  };
  
  // Tabs mit korrekten Rolleneinschränkungen
  const allTabs: TabItem[] = [
    // Basis-Tabs - immer sichtbar im eigenen Profil
    { id: 'overview', label: 'Übersicht', icon: User, allowOwnProfile: true },
    { id: 'profile', label: 'Profil', icon: UserCircle, allowOwnProfile: true },
    { id: 'employment', label: 'Anstellung', icon: Briefcase, allowOwnProfile: true },
    { id: 'documents', label: 'Dokumente', icon: FileText, allowOwnProfile: true },
    { id: 'salary', label: 'Gehalt', icon: DollarSign, requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
    { id: 'vacation', label: 'Urlaub', icon: Calendar, allowOwnProfile: true },
    { id: 'time', label: 'Arbeitszeiten', icon: Clock, allowOwnProfile: true },
    { id: 'planning', label: 'Planung', icon: TrendingUp, allowOwnProfile: true },
    { id: 'shifts', label: 'Schichtplanung', icon: Clock, allowOwnProfile: true },
    { id: 'sick', label: 'Krankmeldung', icon: Activity, allowOwnProfile: true },
    
    // Zeit & Remote
    { id: 'remote-work', label: 'Remote Work', icon: Home, allowOwnProfile: true },
    
    // Entwicklung - eigenes Profil erlaubt
    { id: 'career', label: 'Karriere', icon: TrendingUp, allowOwnProfile: true },
    { id: 'performance', label: 'Performance', icon: TrendingUp, requiresRole: ['admin', 'hr_admin', 'manager'] },
    { id: 'goals', label: 'Ziele', icon: Target, allowOwnProfile: true },
    { id: 'feedback', label: '360° Feedback', icon: MessageSquare, allowOwnProfile: true },
    { id: 'training', label: 'Weiterbildung', icon: GraduationCap, allowOwnProfile: true },
    { id: 'skills', label: 'Skills', icon: Star, allowOwnProfile: true },
    { id: 'certificates', label: 'Zertifikate', icon: CheckCircle, allowOwnProfile: true },
    
    // Projekte - eigenes Profil erlaubt
    { id: 'projects', label: 'Projekte', icon: Briefcase, allowOwnProfile: true },
    { id: 'tasks', label: 'Aufgaben', icon: CheckSquare, allowOwnProfile: true },
    
    // Lebenszyklus
    { id: 'onboarding', label: 'Onboarding', icon: Users, allowOwnProfile: true },
    { id: 'offboarding', label: 'Offboarding', icon: UserX, requiresRole: ['admin', 'hr_admin', 'manager'] },
    
    // Benefits & Finanzen
    { id: 'benefits', label: 'Benefits', icon: Gift, requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
    { id: 'insurance', label: 'Versicherungen', icon: Shield, requiresRole: ['admin', 'hr_admin'] },
    { id: 'expenses', label: 'Ausgaben', icon: Receipt, allowOwnProfile: true },
    { id: 'awards', label: 'Auszeichnungen', icon: Trophy, allowOwnProfile: true },
    
    // Kommunikation
    { id: 'communication', label: 'Kommunikation', icon: MessageSquare, allowOwnProfile: true },
    { id: 'surveys', label: 'Umfragen', icon: ClipboardList, allowOwnProfile: true },
    
    // Admin-Only Tabs
    { id: 'compliance', label: 'Compliance Hub', icon: Shield, requiresRole: ['admin', 'hr_admin'] },
    { id: 'roles', label: 'Rollen', icon: Settings, requiresRole: ['admin'] },
    { id: 'hr-notes', label: 'HR-Notizen', icon: FileText, requiresRole: ['admin', 'hr_admin'] },
    { id: 'health', label: 'Gesundheit', icon: Heart, requiresRole: ['admin', 'hr_admin'] },
    { id: 'travel', label: 'Business Travel', icon: Plane, requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
    { id: 'fleet', label: 'Fuhrpark', icon: Car, requiresRole: ['admin', 'hr_admin'] },
    { id: 'sustainability', label: 'Nachhaltigkeit', icon: Leaf, allowOwnProfile: true },
    { id: 'permissions', label: 'Berechtigungen', icon: Shield, requiresRole: ['admin'] },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell, allowOwnProfile: true },
    
    // Zusätzliche Tabs
    { id: 'equipment', label: 'Arbeitsmittel', icon: Laptop, allowOwnProfile: true },
    { id: 'contracts', label: 'Verträge', icon: FileSignature, requiresRole: ['admin', 'hr_admin', 'manager'] },
    { id: 'team-history', label: 'Team-Historie', icon: Users, allowOwnProfile: true },
    { id: 'warnings', label: 'Verwarnungen', icon: AlertTriangle, requiresRole: ['admin', 'hr_admin'] },
    { id: 'it-access', label: 'IT-Zugang', icon: KeyRound, requiresRole: ['admin', 'hr_admin'] },
  ];

  // Tabs filtern basierend auf Benutzerrollen und isOwnProfile
  const visibleTabs = allTabs.filter(tab => hasRequiredRole(tab.requiresRole, tab.allowOwnProfile));

  return (
    <div className="grid grid-cols-10 gap-1.5">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg transition-colors",
              currentTab === tab.id 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] text-center leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};