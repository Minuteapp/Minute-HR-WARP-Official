import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Users, Building, Clock, DollarSign, UserPlus, Target, GraduationCap, 
  FileText, Bell, Plug, Shield, Bot, Search, Globe, LayoutDashboard, 
  Plane, Calendar, CheckSquare, FolderKanban, Headphones, CalendarDays, 
  Wallet, Gift, UserCheck, GitBranch, Lightbulb, BookOpen, Map, 
  UsersRound, Briefcase, Network, UserX, ShieldCheck, Building2, 
  ClockIcon, FolderOpen, UserCog, Coins, Settings, Brain, FileCheck,
  LucideIcon, Lock, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { useSettingsModulePermissions } from '@/hooks/useSettingsModulePermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SettingsModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  tags: string[];
  color: string;
}

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  modules: SettingsModule[];
}

const settingsCategories: SettingsCategory[] = [
  {
    id: "organization",
    title: "Organisation & Struktur",
    description: "Unternehmensdaten, Organigramm und Benutzerrechte",
    icon: Building2,
    color: "bg-emerald-500",
    modules: [
      {
        id: "company-info",
        title: "Unternehmensinformationen",
        description: "Stammdaten, Holding, Gesellschaften, Standorte, Abteilungen und Teams",
        icon: Building,
        path: "/settings/company-information",
        tags: ["Stammdaten", "Holding", "Gesellschaften", "Standorte", "Abteilungen", "Teams"],
        color: "bg-green-500"
      },
      {
        id: "orgchart",
        title: "Organigramm",
        description: "Organisationsstruktur, Berichtslinien und Anzeigeoptionen",
        icon: Network,
        path: "/settings/orgchart",
        tags: ["Organisation", "Struktur", "Berichtslinien"],
        color: "bg-gray-600"
      },
      {
        id: "users-roles",
        title: "Benutzer & Rechte",
        description: "Enterprise-Verwaltung von Benutzern, Rollen und granularen Berechtigungen",
        icon: Users,
        path: "/settings/users",
        tags: ["Benutzerverwaltung", "Rechtematrix", "Enterprise", "Granulare Berechtigungen"],
        color: "bg-blue-500"
      }
    ]
  },
  {
    id: "time-attendance",
    title: "Zeit & Anwesenheit",
    description: "Zeiterfassung, Abwesenheiten, Kalender und Schichtplanung",
    icon: ClockIcon,
    color: "bg-blue-500",
    modules: [
      {
        id: "timetracking",
        title: "Zeiterfassung & Arbeitszeit",
        description: "Konfiguration von Zeiterfassung, Arbeitszeitmodellen, Pausen, Überstunden und Automatisierung",
        icon: Clock,
        path: "/settings/timetracking",
        tags: ["Zeiterfassung", "Arbeitszeitmodelle", "Gleitzeit", "Überstunden", "Pausen", "Buchungsregeln"],
        color: "bg-blue-600"
      },
      {
        id: "absence",
        title: "Abwesenheits-Management",
        description: "Steuerung von Urlaubsarten, Abwesenheitsregeln und Genehmigungsprozessen",
        icon: Calendar,
        path: "/settings/absence",
        tags: ["Abwesenheitsarten", "Urlaubsverwaltung", "Genehmigungsworkflows", "Krankmeldungen"],
        color: "bg-purple-500"
      },
      {
        id: "calendar",
        title: "Kalender",
        description: "Kalenderansichten, Synchronisation, Buchungsregeln und Termine",
        icon: Calendar,
        path: "/settings/calendar",
        tags: ["Kalender", "Termine", "Synchronisation", "Feiertage", "Buchungsregeln"],
        color: "bg-indigo-500"
      },
      {
        id: "shift-planning",
        title: "Schichtplanung",
        description: "Schichtmodelle, Regeln, Vorlagen und Rotationsmuster",
        icon: CalendarDays,
        path: "/settings/shift-planning",
        tags: ["Schichtmodelle", "Schichtregeln", "Rotation", "Vorlagen"],
        color: "bg-amber-500"
      }
    ]
  },
  {
    id: "projects-tasks",
    title: "Projekte & Aufgaben",
    description: "Aufgaben, Projekte, Roadmaps und Workflows",
    icon: FolderOpen,
    color: "bg-orange-500",
    modules: [
      {
        id: "tasks",
        title: "Aufgaben-Management",
        description: "Konfiguration von Aufgaben, Prioritäten, Labels und Workflows",
        icon: CheckSquare,
        path: "/settings/tasks",
        tags: ["Aufgaben", "Prioritäten", "Labels", "Workflows", "Vorlagen"],
        color: "bg-orange-500"
      },
      {
        id: "projects",
        title: "Projekte & Roadmaps",
        description: "Projektkonfiguration, Vorlagen, Status und Phasen verwalten",
        icon: FolderKanban,
        path: "/settings/projects",
        tags: ["Projektvorlagen", "Roadmaps", "Status", "Phasen", "Portfolio"],
        color: "bg-indigo-600"
      },
      {
        id: "workflow",
        title: "Workflow-Management",
        description: "Workflow-Designer, Genehmigungsketten und Automatisierung",
        icon: GitBranch,
        path: "/settings/workflow",
        tags: ["Workflows", "Genehmigungen", "Automatisierung", "Trigger"],
        color: "bg-violet-600"
      }
    ]
  },
  {
    id: "hr-employees",
    title: "HR & Mitarbeiter",
    description: "Recruiting, Onboarding, Performance und Entwicklung",
    icon: UserCog,
    color: "bg-pink-500",
    modules: [
      {
        id: "recruiting",
        title: "Recruiting & Bewerbermanagement",
        description: "Einstellungen zur Personalgewinnung",
        icon: UserPlus,
        path: "/settings/recruiting",
        tags: ["Bewerberverwaltung", "Recruiting-Richtlinien"],
        color: "bg-pink-500"
      },
      {
        id: "onboarding",
        title: "Onboarding",
        description: "Onboarding-Vorlagen, Checklisten und Buddy-System",
        icon: UserCheck,
        path: "/settings/onboarding",
        tags: ["Vorlagen", "Checklisten", "Workflows", "Buddy-System"],
        color: "bg-teal-500"
      },
      {
        id: "offboarding",
        title: "Offboarding",
        description: "Exit-Interviews, Rückgabeprozesse und Wissenstransfer",
        icon: UserX,
        path: "/settings/offboarding",
        tags: ["Exit-Interviews", "Rückgabe", "Wissenstransfer"],
        color: "bg-rose-500"
      },
      {
        id: "performance",
        title: "Ziel- & Performance-Management",
        description: "Regeln & Methoden zur Zielverfolgung",
        icon: Target,
        path: "/settings/performance",
        tags: ["Zielverfolgung", "Performance-Richtlinien"],
        color: "bg-orange-500"
      },
      {
        id: "training",
        title: "Weiterbildung & Schulungen",
        description: "Einstellungen für Mitarbeiterentwicklung",
        icon: GraduationCap,
        path: "/settings/training",
        tags: ["Schulungsverwaltung", "Schulungsrichtlinien"],
        color: "bg-teal-500"
      },
      {
        id: "workforce-planning",
        title: "Workforce Planning",
        description: "Kapazitätsplanung, Skill-Matrix und Nachfolgeplanung",
        icon: UsersRound,
        path: "/settings/workforce-planning",
        tags: ["Kapazität", "Skills", "Nachfolge", "Headcount"],
        color: "bg-slate-600"
      }
    ]
  },
  {
    id: "finance-travel",
    title: "Finanzen & Reisen",
    description: "Gehälter, Spesen, Reisen und Assets",
    icon: Coins,
    color: "bg-yellow-500",
    modules: [
      {
        id: "payroll",
        title: "Gehalts- & Lohnabrechnung",
        description: "Verwaltung von Vergütungsrichtlinien & Abrechnungen",
        icon: DollarSign,
        path: "/settings/payroll",
        tags: ["Vergütungsrichtlinien", "Abrechnungen"],
        color: "bg-yellow-500"
      },
      {
        id: "expenses",
        title: "Spesenabrechnung",
        description: "Spesenkategorien, Limits, Genehmigungsworkflows und Belegpflichten",
        icon: Wallet,
        path: "/settings/expenses",
        tags: ["Spesen", "Kategorien", "Limits", "Belege", "Kilometersätze"],
        color: "bg-emerald-600"
      },
      {
        id: "business-travel",
        title: "Geschäftsreisen",
        description: "Umfassende Reiserichtlinien, Workflows und Compliance-Management",
        icon: Plane,
        path: "/settings/business-travel",
        tags: ["Reiserichtlinien", "Genehmigungsworkflows", "Budgets", "Duty of Care", "CO₂-Tracking"],
        color: "bg-sky-500"
      },
      {
        id: "assets",
        title: "Assets & Equipment",
        description: "Asset-Kategorien, Inventar und Zuweisungsregeln",
        icon: Briefcase,
        path: "/settings/assets",
        tags: ["Assets", "Inventar", "Zuweisung", "Abschreibungen"],
        color: "bg-stone-600"
      }
    ]
  },
  {
    id: "system-integration",
    title: "System & Integration",
    description: "Dashboard, globale Einstellungen, APIs und Sicherheit",
    icon: Settings,
    color: "bg-gray-500",
    modules: [
      {
        id: "dashboard",
        title: "Dashboard-Konfiguration",
        description: "Personalisieren Sie Ihr Dashboard mit Widgets und Layouts",
        icon: LayoutDashboard,
        path: "/settings/dashboard",
        tags: ["Dashboard Builder", "Widgets", "Layout-Anpassung", "Vorlagen"],
        color: "bg-blue-600"
      },
      {
        id: "global",
        title: "Globale Einstellungen",
        description: "Sprache, Design, Lokalisierung und Barrierefreiheit",
        icon: Globe,
        path: "/settings/global",
        tags: ["Multi-Language", "Dark Mode", "Währung", "Zeitzone", "Barrierefreiheit"],
        color: "bg-emerald-500"
      },
      {
        id: "integrations",
        title: "API & Integrationen",
        description: "Externe Tools & Schnittstellen verwalten",
        icon: Plug,
        path: "/settings/integrations",
        tags: ["Externe Tools", "Schnittstellen verwalten"],
        color: "bg-cyan-500"
      },
      {
        id: "security",
        title: "System & Sicherheit",
        description: "Systemeinstellungen & Sicherheitskonfiguration",
        icon: Shield,
        path: "/settings/system",
        tags: ["Systemkonfiguration", "Sicherheitseinstellungen"],
        color: "bg-gray-500"
      },
      {
        id: "ai-automation",
        title: "KI & Automatisierung",
        description: "Einstellungen für KI-Funktionen und Automatisierungen",
        icon: Bot,
        path: "/settings/ai",
        tags: ["KI-Modelle", "Automatisierungsregeln"],
        color: "bg-violet-500"
      }
    ]
  },
  {
    id: "knowledge-innovation",
    title: "Wissen & Innovation",
    description: "Knowledge Hub, Ideen, Helpdesk und Rewards",
    icon: Brain,
    color: "bg-violet-500",
    modules: [
      {
        id: "knowledge",
        title: "Knowledge Hub",
        description: "Wissenskategorien, Artikelvorlagen und Zugriffsrechte",
        icon: BookOpen,
        path: "/settings/knowledge",
        tags: ["Wissen", "Kategorien", "Artikel", "Review-Prozess"],
        color: "bg-blue-700"
      },
      {
        id: "innovation",
        title: "Innovation & Ideen",
        description: "Ideenmanagement, Abstimmungen und Innovation Challenges",
        icon: Lightbulb,
        path: "/settings/innovation",
        tags: ["Ideen", "Abstimmungen", "Challenges", "Prämien"],
        color: "bg-yellow-600"
      },
      {
        id: "helpdesk",
        title: "Helpdesk & Tickets",
        description: "Ticket-Kategorien, SLA-Konfiguration und Eskalationsregeln",
        icon: Headphones,
        path: "/settings/helpdesk",
        tags: ["Tickets", "SLA", "Kategorien", "Eskalation", "Auto-Zuweisung"],
        color: "bg-cyan-500"
      },
      {
        id: "rewards",
        title: "Rewards & Anerkennung",
        description: "Punktesystem, Prämien-Katalog und Anerkennungsregeln",
        icon: Gift,
        path: "/settings/rewards",
        tags: ["Rewards", "Punktesystem", "Prämien", "Anerkennung"],
        color: "bg-pink-600"
      }
    ]
  },
  {
    id: "compliance-documents",
    title: "Compliance & Dokumente",
    description: "Dokumentenmanagement, Benachrichtigungen und Global Mobility",
    icon: FileCheck,
    color: "bg-indigo-500",
    modules: [
      {
        id: "documents",
        title: "Dokumentenmanagement & DSGVO",
        description: "Verwaltung von Dokumenten & Datenschutz",
        icon: FileText,
        path: "/settings/documents",
        tags: ["Dokumentenverwaltung", "DSGVO-Compliance"],
        color: "bg-indigo-500"
      },
      {
        id: "notifications",
        title: "Kommunikation & Benachrichtigungen",
        description: "Steuerung der internen Kommunikation",
        icon: Bell,
        path: "/settings/notifications",
        tags: ["Benachrichtigungen", "Kommunikationskanäle"],
        color: "bg-red-500"
      },
      {
        id: "compliance-dashboard",
        title: "Settings Compliance Dashboard",
        description: "Übersicht aller Einstellungen, Vererbungshierarchien und Änderungshistorie",
        icon: ShieldCheck,
        path: "/settings/compliance-dashboard",
        tags: ["Compliance", "Audit-Log", "Vererbung", "Einstellungsübersicht"],
        color: "bg-emerald-600"
      },
      {
        id: "global-mobility",
        title: "Global Mobility",
        description: "Umzugsrichtlinien, Visa-Management und Steuer-Compliance",
        icon: Map,
        path: "/settings/global-mobility",
        tags: ["Umzug", "Visa", "Steuern", "Einsatzarten"],
        color: "bg-sky-600"
      }
    ]
  }
];

// Alle Module flach für die Suche
const allModules = settingsCategories.flatMap(cat => cat.modules);

export default function SettingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  // Rollenbasierte Filterung
  const { 
    filterSettingsCategories, 
    isSettingVisible, 
    canEditSetting, 
    effectiveRole,
    loading 
  } = useSettingsModulePermissions();

  const handleModuleClick = (module: SettingsModule) => {
    navigate(module.path);
  };

  // Zuerst rollenbasierte Filterung, dann Suchfilterung
  const roleFilteredCategories = filterSettingsCategories(settingsCategories);
  
  const filteredCategories = searchTerm
    ? roleFilteredCategories.map(cat => ({
        ...cat,
        modules: cat.modules.filter(module =>
          module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(cat => cat.modules.length > 0)
    : roleFilteredCategories;

  // Zähle sichtbare Module (nicht alle)
  const visibleModulesCount = roleFilteredCategories.reduce((acc, cat) => acc + cat.modules.length, 0);
  const filteredModulesCount = filteredCategories.reduce((acc, cat) => acc + cat.modules.length, 0);

  return (
    <PageLayout>
      <ModuleHeader 
        title="Einstellungen" 
        subtitle="Zentrale Verwaltung aller Systemeinstellungen"
      />
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Einstellungen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              {filteredModulesCount} von {visibleModulesCount} Modulen
            </span>
          )}
        </div>

        {/* Rollen-Indikator */}
        {effectiveRole && effectiveRole !== 'superadmin' && effectiveRole !== 'admin' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Ihre Rolle <strong className="text-foreground">({effectiveRole})</strong> sieht {visibleModulesCount} von {allModules.length} Einstellungs-Modulen.
              Module mit <Eye className="inline h-3 w-3 text-amber-500" /> sind nur lesbar.
            </span>
          </div>
        )}

        {/* Accordion Kategorien */}
        <Accordion 
          type="multiple" 
          defaultValue={settingsCategories.map(c => c.id)}
          className="space-y-4"
        >
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <AccordionItem 
                key={category.id} 
                value={category.id}
                className="border rounded-lg overflow-hidden bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${category.color} text-white`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{category.title}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                    <Badge variant="secondary" className="mr-2">
                      {category.modules.length} Module
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {category.modules.map((module) => {
                      const Icon = module.icon;
                      const canEdit = canEditSetting(module.id);
                      
                      return (
                        <TooltipProvider key={module.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Card 
                                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 relative"
                                onClick={() => handleModuleClick(module)}
                              >
                                {/* ReadOnly Indikator */}
                                {!canEdit && (
                                  <div className="absolute top-2 right-2">
                                    <Eye className="h-4 w-4 text-amber-500" />
                                  </div>
                                )}
                                <CardHeader className="pb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${module.color} text-white`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-base font-medium">
                                      {module.title}
                                    </CardTitle>
                                  </div>
                                  <CardDescription className="text-sm text-muted-foreground mt-2">
                                    {module.description}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex flex-wrap gap-1">
                                    {module.tags.slice(0, 3).map((tag, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="text-xs px-2 py-0.5"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                    {module.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        +{module.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </TooltipTrigger>
                            {!canEdit && (
                              <TooltipContent>
                                <p>Nur Lesezugriff - Sie können diese Einstellung ansehen, aber nicht bearbeiten</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Einstellungen gefunden</h3>
            <p className="text-muted-foreground">
              Versuchen Sie es mit anderen Suchbegriffen.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}