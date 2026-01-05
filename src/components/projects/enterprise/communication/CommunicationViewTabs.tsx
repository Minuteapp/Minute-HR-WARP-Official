interface CommunicationViewTabsProps {
  activeView: 'updates' | 'documents';
  onViewChange: (view: 'updates' | 'documents') => void;
}

const CommunicationViewTabs = ({ activeView, onViewChange }: CommunicationViewTabsProps) => {
  return (
    <div className="flex gap-2 border-b border-border pb-2">
      <button
        onClick={() => onViewChange('updates')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          activeView === 'updates'
            ? 'bg-gray-100 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Updates & Aktivitäten
      </button>
      <button
        onClick={() => onViewChange('documents')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          activeView === 'documents'
            ? 'bg-gray-100 text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Dokumente
      </button>
    </div>
  );
};

export default CommunicationViewTabs;
