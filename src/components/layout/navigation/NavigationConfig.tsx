import { 
  LayoutDashboard, 
  CalendarDays,
  Bell,
  Users,
  Calendar,
  Clock,
  ListTodo,
  DollarSign,
  UserPlus,
  ChartBar,
  FileText,
  Brain,
  Target,
  UserCircle2,
  Settings2,
  Shield,
  MessageSquare,
  Leaf,
  Receipt,
  FolderKanban,
  Plane,
  ClipboardCheck,
  Thermometer,
  Route,
  PieChart,
  Lightbulb,
  Globe,
  Headphones,
  ShieldCheck,
  TrendingUp,
  Gift,
  GitBranch,
  Network,
  BookOpen,
  CalendarCheck,
  UserCog,
  FileBarChart,
  Phone,
  Stethoscope
} from 'lucide-react';

export interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export interface NavigationCategory {
  label: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

export const mainNavigationItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CalendarDays, label: 'Heute', path: '/today' },
  { icon: Bell, label: 'Benachrichtigungen', path: '/notifications' },
];

// Gruppierte Navigation für bessere Übersicht
export const groupedNavigationItems: NavigationCategory[] = [
  {
    label: 'HR-Kern',
    defaultOpen: true,
    items: [
      { icon: Users, label: 'Mitarbeiter', path: '/employees' },
      { icon: CalendarCheck, label: 'Abwesenheit', path: '/absence' },
      { icon: Clock, label: 'Zeiterfassung', path: '/time' },
      { icon: DollarSign, label: 'Lohn & Gehalt', path: '/payroll' },
      { icon: Stethoscope, label: 'Krankmeldungen', path: '/sick-leave' },
    ]
  },
  {
    label: 'Recruiting & Entwicklung',
    items: [
      { icon: UserPlus, label: 'Recruiting', path: '/recruiting' },
      { icon: UserCog, label: 'Onboarding', path: '/onboarding' },
      { icon: ChartBar, label: 'Performance', path: '/performance' },
      { icon: Target, label: 'Ziele', path: '/goals' },
      { icon: Gift, label: 'Benefits', path: '/rewards' },
    ]
  },
  {
    label: 'Planung & Projekte',
    items: [
      { icon: FolderKanban, label: 'Projekte', path: '/projects' },
      { icon: ListTodo, label: 'Aufgaben', path: '/tasks' },
      { icon: Route, label: 'Roadmap', path: '/projects/roadmap' },
      { icon: ClipboardCheck, label: 'Schichtplanung', path: '/shift-planning' },
      { icon: Calendar, label: 'Kalender', path: '/calendar' },
      { icon: PieChart, label: 'Budget & Forecast', path: '/budget' },
    ]
  },
  {
    label: 'Kommunikation',
    items: [
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
      { icon: Phone, label: 'Business Voicemail', path: '/voicemail' },
      { icon: Headphones, label: 'HR Helpdesk', path: '/helpdesk' },
      { icon: Thermometer, label: 'Mitarbeiterumfragen', path: '/pulse-surveys' },
    ]
  },
  {
    label: 'Organisation',
    items: [
      { icon: TrendingUp, label: 'Workforce Planning', path: '/workforce-planning' },
      { icon: Network, label: 'Organisationsdesign', path: '/hr/organization-design' },
      { icon: Globe, label: 'Global Mobility', path: '/global-mobility' },
      { icon: Plane, label: 'Geschäftsreisen', path: '/business-travel' },
      { icon: Receipt, label: 'Ausgaben', path: '/expenses' },
    ]
  },
  {
    label: 'Analyse & Compliance',
    items: [
      { icon: FileBarChart, label: 'Berichte', path: '/reports' },
      { icon: Brain, label: 'KI-Funktionen', path: '/ai' },
      { icon: ShieldCheck, label: 'Compliance Hub', path: '/compliance' },
      { icon: Leaf, label: 'Nachhaltigkeit', path: '/environment' },
      { icon: BookOpen, label: 'Wissensdatenbank', path: '/knowledge-hub' },
      { icon: FileText, label: 'Dokumente', path: '/documents' },
    ]
  },
  {
    label: 'Automation',
    items: [
      { icon: GitBranch, label: 'Workflows', path: '/workflow' },
      { icon: Lightbulb, label: 'Innovation Hub', path: '/innovation' },
    ]
  }
];

// Fallback: Flache Liste für Kompatibilität
export const featureNavigationItems: NavigationItem[] = [
  { icon: Users, label: 'Mitarbeiter', path: '/employees' },
  { icon: CalendarCheck, label: 'Abwesenheit', path: '/absence' },
  { icon: Calendar, label: 'Kalender', path: '/calendar' },
  { icon: Clock, label: 'Zeiterfassung', path: '/time' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: ListTodo, label: 'Aufgaben', path: '/tasks' },
  { icon: Route, label: 'Roadmap', path: '/projects/roadmap' },
  { icon: FolderKanban, label: 'Projekte', path: '/projects' },
  { icon: PieChart, label: 'Budget & Forecast', path: '/budget' },
  { icon: TrendingUp, label: 'Workforce Planning', path: '/workforce-planning' },
  { icon: Network, label: 'Organisationsdesign', path: '/hr/organization-design' },
  { icon: Thermometer, label: 'Mitarbeiterumfragen', path: '/pulse-surveys' },
  { icon: DollarSign, label: 'Lohn & Gehalt', path: '/payroll' },
  { icon: UserPlus, label: 'Recruiting', path: '/recruiting' },
  { icon: UserCog, label: 'Onboarding', path: '/onboarding' },
  { icon: ChartBar, label: 'Performance', path: '/performance' },
  { icon: BookOpen, label: 'Wissensdatenbank', path: '/knowledge-hub' },
  { icon: FileText, label: 'Dokumente', path: '/documents' },
  { icon: FileBarChart, label: 'Berichte', path: '/reports'  },
  { icon: Receipt, label: 'Ausgaben', path: '/expenses' },
  { icon: Globe, label: 'Global Mobility', path: '/global-mobility' },
  { icon: Headphones, label: 'HR Helpdesk', path: '/helpdesk' },
  { icon: ShieldCheck, label: 'Compliance Hub', path: '/compliance' },
  { icon: Brain, label: 'KI-Funktionen', path: '/ai' },
  { icon: Target, label: 'Ziele', path: '/goals' },
  { icon: Phone, label: 'Business Voicemail', path: '/voicemail' },
  { icon: Leaf, label: 'Nachhaltigkeit', path: '/environment' },
  { icon: Plane, label: 'Geschäftsreisen', path: '/business-travel' },
  { icon: ClipboardCheck, label: 'Schichtplanung', path: '/shift-planning' },
  { icon: Stethoscope, label: 'Krankmeldungen', path: '/sick-leave' },
  { icon: GitBranch, label: 'Workflows', path: '/workflow' },
  { icon: Gift, label: 'Benefits', path: '/rewards' },
  { icon: Lightbulb, label: 'Innovation Hub', path: '/innovation' }
];

export const bottomNavigationItems: NavigationItem[] = [
  { icon: UserCircle2, label: 'Profil', path: '/profile' },
  { icon: Settings2, label: 'Einstellungen', path: '/settings' },
];

export const adminNavigationItem: NavigationItem = {
  icon: Shield,
  label: 'Admin',
  path: '/admin'
};
