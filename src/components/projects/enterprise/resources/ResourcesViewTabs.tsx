interface ResourcesViewTabsProps {
  activeView: 'overview' | 'details' | 'skills-matrix' | 'scheduling';
  onViewChange: (view: 'overview' | 'details' | 'skills-matrix' | 'scheduling') => void;
}

const ResourcesViewTabs = ({ activeView, onViewChange }: ResourcesViewTabsProps) => {
  const tabs = [
    { id: 'overview' as const, label: 'Übersicht' },
    { id: 'details' as const, label: 'Details' },
    { id: 'skills-matrix' as const, label: 'Skills-Matrix' },
    { id: 'scheduling' as const, label: 'Zeitplanung' }
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeView === tab.id
              ? 'bg-muted rounded-t-lg text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ResourcesViewTabs;
