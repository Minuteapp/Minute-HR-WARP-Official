
import { Tag, Shield, Layers, CreditCard, Globe, Sparkles, Download, Archive } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'categories', label: 'Kategorien & Kostenstellen', icon: Tag },
  { id: 'policies', label: 'Richtlinien & Limits', icon: Shield },
  { id: 'approval', label: 'Genehmigungsstufen', icon: Layers },
  { id: 'cards', label: 'Kartenintegration', icon: CreditCard },
  { id: 'currencies', label: 'Währungen & Steuern', icon: Globe },
  { id: 'ai', label: 'KI-Prüfungen', icon: Sparkles },
  { id: 'export', label: 'Exportformate', icon: Download },
  { id: 'archiving', label: 'Archivierung', icon: Archive },
];

const SettingsTabs = ({ activeTab, onTabChange }: SettingsTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-purple-600 text-white'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SettingsTabs;
