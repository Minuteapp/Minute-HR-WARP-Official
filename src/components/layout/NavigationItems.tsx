import { 
  Home, Calendar, Users, FileText, Briefcase, Clock, 
  BarChart3, ArrowLeftRight, Plane, Bot,
  User, Settings, ShieldCheck, Bell, Search, 
  ListTodo, Goal, Folder, Loader, PiggyBank, Headphones 
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  children?: NavigationItem[];
}

export const mainNavItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Heute",
    path: "/today",
    icon: Calendar,
  },
  {
    label: "Aufgaben",
    path: "/tasks",
    icon: ListTodo,
  },
  {
    label: "Kalender",
    path: "/calendar",
    icon: Calendar,
  },
  {
    label: "Ziele",
    path: "/goals",
    icon: Goal,
    children: [
      {
        label: "Dashboard",
        path: "/goals/dashboard",
        icon: Home,
      },
      {
        label: "Persönliche Ziele",
        path: "/goals/personal",
        icon: User,
      },
      {
        label: "Team-Ziele",
        path: "/goals/team",
        icon: Users,
      },
      {
        label: "Unternehmensziele",
        path: "/goals/company",
        icon: Briefcase,
      },
    ],
  },
  {
    label: "Dokumente",
    path: "/documents",
    icon: Folder,
  },
  {
    label: "Mitarbeiter",
    path: "/employees",
    icon: Users,
  },
  {
    label: "Zeit",
    path: "/time",
    icon: Clock,
  },
  {
    label: "Abwesenheit",
    path: "/absence",
    icon: Calendar,
  },
  {
    label: "Geschäftsreisen",
    path: "/business-travel",
    icon: Plane,
  },
  {
    label: "Abrechnungen",
    path: "/payroll",
    icon: PiggyBank,
  },
  {
    label: "Ausgaben",
    path: "/expenses",
    icon: ArrowLeftRight,
  },
  {
    label: "Performance",
    path: "/performance",
    icon: BarChart3,
  },
  {
    label: "Berichte",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "Recruiting",
    path: "/recruiting",
    icon: Briefcase,
  },
  {
    label: "KI-Assistent",
    path: "/ai",
    icon: Bot,
  },
  {
    title: "Schichtplanung",
    href: "/shift-planning",
    icon: Calendar,
    items: [
      {
        title: "Schichtkalender",
        href: "/shift-planning?tab=calendar",
        items: [],
      },
      {
        title: "Schichtarten",
        href: "/shift-planning?tab=types",
        items: [],
      },
      {
        title: "Mitarbeiterzuweisung",
        href: "/shift-planning?tab=assignment",
        items: [],
      },
      {
        title: "Schichtmonitor",
        href: "/shift-planning?tab=monitor",
        items: [],
      },
      {
        title: "Besetzungs-Heatmap",
        href: "/shift-planning?tab=heatmap",
        items: [],
      },
      {
        title: "KI-Assistent",
        href: "/shift-planning?tab=ai",
        items: [],
      },
      {
        title: "Berichte & Exporte",
        href: "/shift-planning?tab=reports",
        items: [],
      },
      {
        title: "Einstellungen",
        href: "/shift-planning/settings",
        items: [],
      },
    ],
  },
];

export const bottomNavigationItems: NavigationItem[] = [
  {
    label: "Profil",
    path: "/profile",
    icon: User,
  },
  {
    label: "Einstellungen",
    path: "/settings",
    icon: Settings,
  },
  {
    label: "Admin",
    path: "/admin",
    icon: ShieldCheck,
  },
];

export const mobileNavigationItems: NavigationItem[] = [
  {
    label: "Benachrichtigungen",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Suche",
    path: "/search",
    icon: Search,
  },
];
