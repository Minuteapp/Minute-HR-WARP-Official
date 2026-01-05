import { cn } from '@/lib/utils';

type ViewType = 'timeline' | 'milestone-list' | 'gantt';

interface PlanningViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const PlanningViewTabs = ({ activeView, onViewChange }: PlanningViewTabsProps) => {
  const tabs = [
    { id: 'timeline' as ViewType, label: 'Timeline-Ansicht' },
    { id: 'milestone-list' as ViewType, label: 'Meilenstein-Liste' },
    { id: 'gantt' as ViewType, label: 'Gantt-Diagramm' }
  ];

  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeView === tab.id
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default PlanningViewTabs;
