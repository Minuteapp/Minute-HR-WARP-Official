
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  User, 
  Users, 
  Calendar, 
  CheckSquare, 
  Target,
  DollarSign,
  Settings 
} from "lucide-react";

interface FormTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FormTabsNavigation = ({ activeTab, onTabChange }: FormTabsNavigationProps) => {
  const tabs = [
    { id: "basic-info", label: "Grunddaten", icon: User },
    { id: "team", label: "Team", icon: Users },
    { id: "timeline", label: "Zeitplanung", icon: Calendar },
    { id: "tasks", label: "Aufgaben", icon: CheckSquare },
    { id: "goals", label: "Ziele", icon: Target },
    { id: "resources", label: "Ressourcen", icon: DollarSign },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
