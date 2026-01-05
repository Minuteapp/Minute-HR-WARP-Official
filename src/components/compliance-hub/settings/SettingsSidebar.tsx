import { Settings, FileText, Clock, Lock, GraduationCap, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "general", label: "Allgemein", icon: Settings },
  { id: "policies", label: "Richtlinien", icon: FileText },
  { id: "workingTime", label: "Arbeitszeitregeln", icon: Clock },
  { id: "dsgvo", label: "DSGVO / Löschfristen", icon: Lock },
  { id: "training", label: "Schulungen", icon: GraduationCap },
  { id: "notifications", label: "Benachrichtigungen", icon: Bell },
];

export const SettingsSidebar = ({ activeSection, onSectionChange }: SettingsSidebarProps) => {
  return (
    <div className="w-64 border-r bg-card">
      <nav className="space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-600 border-l-2 border-purple-600"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
