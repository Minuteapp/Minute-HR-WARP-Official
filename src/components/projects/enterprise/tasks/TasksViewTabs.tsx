import { cn } from '@/lib/utils';

type ViewType = 'kanban' | 'list';

interface TasksViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TasksViewTabs = ({ activeView, onViewChange }: TasksViewTabsProps) => {
  const tabs = [
    { id: 'kanban' as ViewType, label: 'Kanban Board' },
    { id: 'list' as ViewType, label: 'Listen-Ansicht' }
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

export default TasksViewTabs;
