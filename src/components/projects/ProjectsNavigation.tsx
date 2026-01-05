
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { 
  Briefcase, 
  ListTodo, 
  Calendar, 
  BarChart3, 
  Users, 
  FileText,
  Kanban
} from "lucide-react";

interface ProjectsNavigationProps {
  currentPath: string;
}

export const ProjectsNavigation = ({ currentPath }: ProjectsNavigationProps) => {
  const navigationItems = [
    {
      title: "Projekt-Dashboard", 
      path: "/projects",
      icon: BarChart3,
      description: "Übersicht und Statistiken"
    },
    {
      title: "Alle Projekte",
      path: "/projects/list", 
      icon: ListTodo,
      description: "Vollständige Liste aller Projekte"
    },
    {
      title: "Visual Tools",
      path: "/projects/visual-tools",
      icon: Briefcase,
      description: "Site Map, User Flow & Mind Map Tools"
    },
    {
      title: "Portfolio-Dashboard",
      path: "/projects/portfolio",
      icon: BarChart3,
      description: "Strategische Übersicht und Analysen"
    },
    {
      title: "Gantt-Ansicht",
      path: "/projects/gantt",
      icon: Calendar,
      description: "Timeline und Projektplanung"
    },
    {
      title: "Kanban-Board",
      path: "/projects/kanban",
      icon: Kanban,
      description: "Agile Projektübersicht"
    },
    {
      title: "Verwaltung",
      path: "/projects/manage",
      icon: Briefcase,
      description: "Projektmanagement und -konfiguration"
    },
    {
      title: "Team-Ansicht",
      path: "/projects/teams",
      icon: Users,
      description: "Team-Zuweisungen und Kapazitäten"
    },
    {
      title: "Reports",
      path: "/projects/reports",
      icon: FileText,
      description: "Berichte und Analysen"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        
        return (
          <NavLink key={item.path} to={item.path}>
            <Button
              variant={isActive ? "default" : "outline"}
              className={`h-auto p-6 flex flex-col items-start gap-3 w-full text-left ${
                isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span className="font-medium">{item.title}</span>
              </div>
              <p className={`text-sm leading-relaxed ${
                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {item.description}
              </p>
            </Button>
          </NavLink>
        );
      })}
    </div>
  );
};
