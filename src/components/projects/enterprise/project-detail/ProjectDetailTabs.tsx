
import { SubTabType } from "./ProjectDetailPage";

interface ProjectDetailTabsProps {
  activeTab: SubTabType;
  onTabChange: (tab: SubTabType) => void;
}

const tabs: { id: SubTabType; label: string }[] = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'milestones', label: 'Meilensteine' },
  { id: 'tasks', label: 'Aufgaben' },
  { id: 'risks', label: 'Risiken' },
];

export const ProjectDetailTabs = ({ activeTab, onTabChange }: ProjectDetailTabsProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-all
            ${activeTab === tab.id
              ? 'bg-white border border-gray-200 shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
