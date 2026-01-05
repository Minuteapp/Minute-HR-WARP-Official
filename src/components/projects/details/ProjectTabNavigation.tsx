import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, CheckSquare, Folder, Settings, Map, GitBranch, Brain, Eye } from "lucide-react";

interface ProjectTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProjectTabNavigation = ({ activeTab, setActiveTab }: ProjectTabNavigationProps) => {
  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: Eye },
    { id: 'tasks', label: 'Aufgaben', icon: CheckSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'documents', label: 'Dokumente', icon: Folder },
    { id: 'milestones', label: 'Meilensteine', icon: FileText },
    { id: 'modules', label: 'Module', icon: Settings },
    { id: 'sitemap', label: 'Site Map', icon: Map },
    { id: 'userflow', label: 'User Flow', icon: GitBranch },
    { id: 'mindmap', label: 'Mind Map', icon: Brain },
    { id: 'details', label: 'Details', icon: Settings },
  ];

  return (
    <div className="border-b bg-background">
      <div className="flex h-14 items-center px-6 overflow-x-auto">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};