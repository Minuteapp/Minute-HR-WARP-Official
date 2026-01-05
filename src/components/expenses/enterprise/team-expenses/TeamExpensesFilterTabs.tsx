
import { Button } from '@/components/ui/button';
import { Layers, Building2, Globe, Tag } from 'lucide-react';

type FilterView = 'division' | 'department' | 'region' | 'category';

interface TeamExpensesFilterTabsProps {
  activeView: FilterView;
  onViewChange: (view: FilterView) => void;
}

const TeamExpensesFilterTabs = ({ activeView, onViewChange }: TeamExpensesFilterTabsProps) => {
  const tabs = [
    { id: 'division' as FilterView, label: 'Nach Division', icon: Layers },
    { id: 'department' as FilterView, label: 'Nach Abteilung', icon: Building2 },
    { id: 'region' as FilterView, label: 'Nach Region', icon: Globe },
    { id: 'category' as FilterView, label: 'Nach Kategorie', icon: Tag }
  ];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeView === tab.id ? 'default' : 'outline'}
          onClick={() => onViewChange(tab.id)}
          className={activeView === tab.id 
            ? 'bg-purple-600 hover:bg-purple-700 text-white rounded-full' 
            : 'border-border rounded-full'
          }
        >
          <tab.icon className="h-4 w-4 mr-2" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default TeamExpensesFilterTabs;
