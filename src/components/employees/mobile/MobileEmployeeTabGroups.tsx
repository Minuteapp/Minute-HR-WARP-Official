import { useState } from 'react';
import { 
  Star, User, UserCircle, Briefcase, FileText, DollarSign,
  Calendar, Clock, TrendingUp, Activity, Home, Target,
  MessageSquare, GraduationCap, CheckCircle, CheckSquare,
  Gift, Shield, Receipt, Trophy, ClipboardList, Settings,
  Heart, Plane, Car, Leaf, Users
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface TabGroup {
  id: string;
  title: string;
  icon: any;
  count: number;
  tabs: TabItem[];
}

interface MobileEmployeeTabGroupsProps {
  employeeId: string;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileEmployeeTabGroups = ({ 
  employeeId, 
  currentTab, 
  onTabChange 
}: MobileEmployeeTabGroupsProps) => {
  const [openGroups, setOpenGroups] = useState<string[]>(['favorites', 'primary']);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const tabGroups: TabGroup[] = [
    {
      id: 'favorites',
      title: 'Favoriten',
      icon: Star,
      count: 4,
      tabs: [
        { id: 'overview', label: 'Übersicht', icon: User },
        { id: 'profile', label: 'Profil', icon: UserCircle },
        { id: 'employment', label: 'Anstellung', icon: Briefcase },
        { id: 'documents', label: 'Dokumente', icon: FileText },
      ]
    },
    {
      id: 'primary',
      title: 'Primäre Daten',
      icon: ClipboardList,
      count: 5,
      tabs: [
        { id: 'overview', label: 'Übersicht', icon: User },
        { id: 'profile', label: 'Profil', icon: UserCircle },
        { id: 'employment', label: 'Anstellung', icon: Briefcase },
        { id: 'documents', label: 'Dokumente', icon: FileText },
        { id: 'salary', label: 'Gehalt', icon: DollarSign },
      ]
    },
    {
      id: 'time',
      title: 'Zeit & Abwesenheit',
      icon: Clock,
      count: 6,
      tabs: [
        { id: 'vacation', label: 'Urlaub', icon: Calendar },
        { id: 'timetracking', label: 'Arbeitszeiten', icon: Clock },
        { id: 'planning', label: 'Planung', icon: TrendingUp },
        { id: 'shifts', label: 'Schichtplanung', icon: Clock },
        { id: 'sickness', label: 'Krankenmeldung', icon: Activity },
        { id: 'remote', label: 'Remote Work', icon: Home },
      ]
    },
    {
      id: 'development',
      title: 'Entwicklung & Performance',
      icon: TrendingUp,
      count: 7,
      tabs: [
        { id: 'career', label: 'Karriere', icon: TrendingUp },
        { id: 'performance', label: 'Performance', icon: TrendingUp },
        { id: 'goals', label: 'Ziele', icon: Target },
        { id: 'feedback', label: '360° Feedback', icon: MessageSquare },
        { id: 'training', label: 'Weiterbildung', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Star },
        { id: 'certificates', label: 'Zertifikate', icon: CheckCircle },
      ]
    },
    {
      id: 'projects',
      title: 'Projekte & Aufgaben',
      icon: Briefcase,
      count: 2,
      tabs: [
        { id: 'projects', label: 'Projekte', icon: Briefcase },
        { id: 'tasks', label: 'Aufgaben', icon: CheckSquare },
      ]
    },
    {
      id: 'benefits',
      title: 'Benefits & Vergütung',
      icon: Gift,
      count: 4,
      tabs: [
        { id: 'onboarding', label: 'Onboarding', icon: Users },
        { id: 'benefits', label: 'Benefits', icon: Gift },
        { id: 'insurance', label: 'Versicherungen', icon: Shield },
        { id: 'expenses', label: 'Ausgaben', icon: Receipt },
      ]
    },
    {
      id: 'communication',
      title: 'Kommunikation',
      icon: MessageSquare,
      count: 4,
      tabs: [
        { id: 'awards', label: 'Auszeichnungen', icon: Trophy },
        { id: 'communication', label: 'Kommunikation', icon: MessageSquare },
        { id: 'surveys', label: 'Umfragen', icon: ClipboardList },
        { id: 'compliance', label: 'Compliance Hub', icon: Shield },
      ]
    },
    {
      id: 'admin',
      title: 'Compliance & Admin',
      icon: Shield,
      count: 4,
      tabs: [
        { id: 'roles', label: 'Rollen', icon: Settings },
        { id: 'hrnotes', label: 'HR-Notizen', icon: FileText },
        { id: 'health', label: 'Gesundheit', icon: Heart },
        { id: 'travel', label: 'Business Travel', icon: Plane },
      ]
    },
    {
      id: 'other',
      title: 'Sonstige',
      icon: Car,
      count: 2,
      tabs: [
        { id: 'fleet', label: 'Fuhrpark', icon: Car },
        { id: 'sustainability', label: 'Nachhaltigkeit', icon: Leaf },
      ]
    },
  ];

  return (
    <div className="space-y-2">
      {tabGroups.map((group) => (
        <Collapsible
          key={group.id}
          open={openGroups.includes(group.id)}
          onOpenChange={() => toggleGroup(group.id)}
        >
          <CollapsibleTrigger className="w-full">
            <div className="bg-card border border-border rounded-lg p-2.5 hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const GroupIcon = group.icon;
                    return <GroupIcon className="w-4 h-4 text-muted-foreground" />;
                  })()}
                  <div className="text-left text-[12px] font-medium text-foreground">{group.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {group.count}
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
            <div className="mt-2 bg-card border border-border rounded-lg p-2.5">
              <div className="grid grid-cols-4 gap-2">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                        currentTab === tab.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] text-center leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};
