import { useState } from 'react';
import { 
  Star, User, UserCircle, Briefcase, FileText, DollarSign,
  Calendar, Clock, TrendingUp, Activity, Home, Target,
  MessageSquare, GraduationCap, CheckCircle, CheckSquare,
  Gift, Shield, Receipt, Trophy, ClipboardList, Settings,
  Heart, Plane, Car, Leaf, Users, UserX
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffectiveRole } from '@/hooks/useEffectiveRole';

interface TabItem {
  id: string;
  label: string;
  icon: any;
  description: string;
  isFavorite?: boolean;
  requiresRole?: ('admin' | 'hr_admin' | 'manager')[];
  allowOwnProfile?: boolean;
}

interface TabGroup {
  id: string;
  title: string;
  icon: any;
  tabs: TabItem[];
}

interface EmployeeTabGroupsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
}

export const EmployeeTabGroups = ({ 
  currentTab, 
  onTabChange,
  isOwnProfile = false
}: EmployeeTabGroupsProps) => {
  const [openGroups, setOpenGroups] = useState<string[]>(['favorites', 'primary']);
  const { isAdmin, isHROrAdmin, isTeamleadOrHigher } = useEffectiveRole();

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

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

  const tabGroups: TabGroup[] = [
    {
      id: 'favorites',
      title: 'Favoriten',
      icon: Star,
      tabs: [
        { id: 'overview', label: 'Übersicht', icon: User, description: 'Mitarbeiter-Schnellübersicht', isFavorite: true, allowOwnProfile: true },
        { id: 'profile', label: 'Profil', icon: UserCircle, description: 'Persönliche Daten', isFavorite: true, allowOwnProfile: true },
        { id: 'employment', label: 'Anstellung', icon: Briefcase, description: 'Vertragsdaten & Position', isFavorite: true, allowOwnProfile: true },
        { id: 'documents', label: 'Dokumente', icon: FileText, description: 'Dateien & Unterlagen', isFavorite: true, allowOwnProfile: true },
      ]
    },
    {
      id: 'primary',
      title: 'Primäre Daten',
      icon: ClipboardList,
      tabs: [
        { id: 'overview', label: 'Übersicht', icon: User, description: 'Mitarbeiter-Schnellübersicht', allowOwnProfile: true },
        { id: 'profile', label: 'Profil', icon: UserCircle, description: 'Persönliche Daten', allowOwnProfile: true },
        { id: 'employment', label: 'Anstellung', icon: Briefcase, description: 'Vertragsdaten & Position', allowOwnProfile: true },
        { id: 'documents', label: 'Dokumente', icon: FileText, description: 'Dateien & Unterlagen', allowOwnProfile: true },
        { id: 'salary', label: 'Gehalt', icon: DollarSign, description: 'Vergütung & Zahlungen', requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
      ]
    },
    {
      id: 'time',
      title: 'Zeit & Abwesenheit',
      icon: Clock,
      tabs: [
        { id: 'vacation', label: 'Urlaub', icon: Calendar, description: 'Urlaubsanträge & Kontingente', allowOwnProfile: true },
        { id: 'time', label: 'Arbeitszeiten', icon: Clock, description: 'Zeiterfassung & Stunden', allowOwnProfile: true },
        { id: 'planning', label: 'Planung', icon: TrendingUp, description: 'Einsatzplanung', allowOwnProfile: true },
        { id: 'shifts', label: 'Schichtplanung', icon: Clock, description: 'Schichten & Dienste', allowOwnProfile: true },
        { id: 'sick', label: 'Krankmeldung', icon: Activity, description: 'Krankmeldungen & AU', allowOwnProfile: true },
        { id: 'remote-work', label: 'Remote Work', icon: Home, description: 'Homeoffice & Remote', allowOwnProfile: true },
      ]
    },
    {
      id: 'development',
      title: 'Entwicklung & Performance',
      icon: TrendingUp,
      tabs: [
        { id: 'career', label: 'Karriere', icon: TrendingUp, description: 'Karriereplanung & Entwicklung', allowOwnProfile: true },
        { id: 'performance', label: 'Performance', icon: TrendingUp, description: 'Leistungsbeurteilung', requiresRole: ['admin', 'hr_admin', 'manager'] },
        { id: 'goals', label: 'Ziele', icon: Target, description: 'Zielsetzung & OKRs', allowOwnProfile: true },
        { id: 'feedback', label: '360° Feedback', icon: MessageSquare, description: 'Feedback & Bewertungen', allowOwnProfile: true },
        { id: 'training', label: 'Weiterbildung', icon: GraduationCap, description: 'Schulungen & Kurse', allowOwnProfile: true },
        { id: 'skills', label: 'Skills', icon: Star, description: 'Fähigkeiten & Kompetenzen', allowOwnProfile: true },
        { id: 'certificates', label: 'Zertifikate', icon: CheckCircle, description: 'Zertifikate & Qualifikationen', allowOwnProfile: true },
      ]
    },
    {
      id: 'projects',
      title: 'Projekte & Aufgaben',
      icon: Briefcase,
      tabs: [
        { id: 'projects', label: 'Projekte', icon: Briefcase, description: 'Projektbeteiligungen', allowOwnProfile: true },
        { id: 'tasks', label: 'Aufgaben', icon: CheckSquare, description: 'Aufgaben & To-Dos', allowOwnProfile: true },
        { id: 'goals', label: 'Ziele', icon: Target, description: 'Zielsetzung & OKRs', allowOwnProfile: true },
      ]
    },
    {
      id: 'lifecycle',
      title: 'Mitarbeiter-Lebenszyklus',
      icon: Users,
      tabs: [
        { id: 'onboarding', label: 'Onboarding', icon: Users, description: 'Einarbeitung & Onboarding', allowOwnProfile: true },
        { id: 'offboarding', label: 'Offboarding', icon: UserX, description: 'Offboarding-Prozess', requiresRole: ['admin', 'hr_admin', 'manager'] },
      ]
    },
    {
      id: 'benefits',
      title: 'Benefits & Vergütung',
      icon: Gift,
      tabs: [
        { id: 'benefits', label: 'Benefits', icon: Gift, description: 'Zusatzleistungen & Benefits', requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
        { id: 'insurance', label: 'Versicherungen', icon: Shield, description: 'Versicherungen & Vorsorge', requiresRole: ['admin', 'hr_admin'] },
        { id: 'expenses', label: 'Ausgaben', icon: Receipt, description: 'Spesen & Erstattungen', allowOwnProfile: true },
      ]
    },
    {
      id: 'communication',
      title: 'Kommunikation',
      icon: MessageSquare,
      tabs: [
        { id: 'communication', label: 'Kommunikation', icon: MessageSquare, description: 'Nachrichten & Chat', allowOwnProfile: true },
        { id: 'surveys', label: 'Umfragen', icon: ClipboardList, description: 'Mitarbeiterumfragen', allowOwnProfile: true },
      ]
    },
    {
      id: 'admin',
      title: 'Compliance & Admin',
      icon: Shield,
      tabs: [
        { id: 'roles', label: 'Rollen', icon: Settings, description: 'Berechtigungen & Rollen', requiresRole: ['admin'] },
        { id: 'hr-notes', label: 'HR-Notizen', icon: FileText, description: 'Interne Notizen', requiresRole: ['admin', 'hr_admin'] },
        { id: 'compliance', label: 'Compliance Hub', icon: Shield, description: 'Compliance & Richtlinien', requiresRole: ['admin', 'hr_admin'] },
      ]
    },
    {
      id: 'other',
      title: 'Sonstige',
      icon: Car,
      tabs: [
        { id: 'health', label: 'Gesundheit', icon: Heart, description: 'Gesundheit & Vorsorge', requiresRole: ['admin', 'hr_admin'] },
        { id: 'awards', label: 'Auszeichnungen', icon: Trophy, description: 'Auszeichnungen & Anerkennungen', allowOwnProfile: true },
        { id: 'travel', label: 'Business Travel', icon: Plane, description: 'Geschäftsreisen', requiresRole: ['admin', 'hr_admin'], allowOwnProfile: true },
        { id: 'fleet', label: 'Fuhrpark', icon: Car, description: 'Firmenwagen & Fahrzeuge', requiresRole: ['admin', 'hr_admin'] },
        { id: 'sustainability', label: 'Nachhaltigkeit', icon: Leaf, description: 'Nachhaltigkeit & Umwelt', allowOwnProfile: true },
      ]
    },
  ];

  // Filtere Tabs basierend auf Benutzerrollen
  const filteredTabGroups = tabGroups.map(group => ({
    ...group,
    tabs: group.tabs.filter(tab => hasRequiredRole(tab.requiresRole, tab.allowOwnProfile))
  })).filter(group => group.tabs.length > 0);

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {filteredTabGroups.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Collapsible
              key={group.id}
              open={openGroups.includes(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="bg-card border border-border rounded-lg p-2 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-4 h-4 text-muted-foreground" />
                      <div className="text-left text-sm font-semibold text-foreground">{group.title}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {group.tabs.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          openGroups.includes(group.id) && "transform rotate-180"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-1.5 bg-card border border-border rounded-lg p-2">
                  <div className="grid grid-cols-9 gap-1.5">
                    {group.tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Tooltip key={tab.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onTabChange(tab.id)}
                              className={cn(
                                "relative flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg transition-colors",
                                currentTab === tab.id 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-accent"
                              )}
                            >
                              {tab.isFavorite && (
                                <Star className="absolute -top-0.5 -right-0.5 w-3 h-3 text-yellow-500 fill-yellow-500" />
                              )}
                              <Icon className="w-4 h-4" />
                              <span className="text-[10px] text-center leading-tight">{tab.label}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{tab.label} - {tab.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </TooltipProvider>
  );
};