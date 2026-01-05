import { 
  User, UserCircle, Briefcase, FileText, DollarSign,
  Calendar, Clock, TrendingUp, Activity, Home, Target,
  MessageSquare, GraduationCap, CheckCircle, CheckSquare,
  Gift, Shield, Receipt, Trophy, ClipboardList, Settings,
  Heart, Plane, Car, Leaf, Users
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface MobileEmployeeAllTabsGridProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileEmployeeAllTabsGrid = ({ currentTab, onTabChange }: MobileEmployeeAllTabsGridProps) => {
  const allTabs: TabItem[] = [
    { id: 'overview', label: 'Übersicht', icon: User },
    { id: 'profile', label: 'Profil', icon: UserCircle },
    { id: 'employment', label: 'Anstellung', icon: Briefcase },
    { id: 'documents', label: 'Dokumente', icon: FileText },
    { id: 'salary', label: 'Gehalt', icon: DollarSign },
    { id: 'vacation', label: 'Urlaub', icon: Calendar },
    { id: 'timetracking', label: 'Arbeitszeiten', icon: Clock },
    { id: 'planning', label: 'Planung', icon: TrendingUp },
    { id: 'shifts', label: 'Schichtplanung', icon: Clock },
    { id: 'sickness', label: 'Krankenmeldung', icon: Activity },
    { id: 'remote', label: 'Remote Work', icon: Home },
    { id: 'career', label: 'Karriere', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'goals', label: 'Ziele', icon: Target },
    { id: 'feedback', label: '360° Feedback', icon: MessageSquare },
    { id: 'training', label: 'Weiterbildung', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: CheckCircle },
    { id: 'certificates', label: 'Zertifikate', icon: CheckCircle },
    { id: 'projects', label: 'Projekte', icon: Briefcase },
    { id: 'tasks', label: 'Aufgaben', icon: CheckSquare },
    { id: 'onboarding', label: 'Onboarding', icon: Users },
    { id: 'benefits', label: 'Benefits', icon: Gift },
    { id: 'insurance', label: 'Versicherungen', icon: Shield },
    { id: 'expenses', label: 'Ausgaben', icon: Receipt },
    { id: 'awards', label: 'Auszeichnungen', icon: Trophy },
    { id: 'communication', label: 'Kommunikation', icon: MessageSquare },
    { id: 'surveys', label: 'Umfragen', icon: ClipboardList },
    { id: 'compliance', label: 'Compliance Hub', icon: Shield },
    { id: 'roles', label: 'Rollen', icon: Settings },
    { id: 'hrnotes', label: 'HR-Notizen', icon: FileText },
    { id: 'health', label: 'Gesundheit', icon: Heart },
    { id: 'travel', label: 'Business Travel', icon: Plane },
    { id: 'fleet', label: 'Fuhrpark', icon: Car },
    { id: 'sustainability', label: 'Nachhaltigkeit', icon: Leaf },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
      <div className="grid grid-cols-4 gap-2">
        {allTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
                currentTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] text-center leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
