
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import SettingsTabs from '../settings/SettingsTabs';
import CategoriesSection from '../settings/categories/CategoriesSection';
import PoliciesLimitsSection from '../settings/policies-limits/PoliciesLimitsSection';
import ApprovalLevelsSection from '../settings/approval-levels/ApprovalLevelsSection';
import CardIntegrationSection from '../settings/card-integration/CardIntegrationSection';
import CurrenciesTaxesSection from '../settings/currencies-taxes/CurrenciesTaxesSection';
import AIChecksSection from '../settings/ai-checks/AIChecksSection';
import ExportFormatsSettingsSection from '../settings/export-formats/ExportFormatsSettingsSection';
import ArchivingSection from '../settings/archiving/ArchivingSection';

const ExpenseSettingsTab = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const handleSaveSettings = () => {
    toast.success('Einstellungen wurden gespeichert');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategoriesSection />;
      case 'policies':
        return <PoliciesLimitsSection />;
      case 'approval':
        return <ApprovalLevelsSection />;
      case 'cards':
        return <CardIntegrationSection />;
      case 'currencies':
        return <CurrenciesTaxesSection />;
      case 'ai':
        return <AIChecksSection />;
      case 'export':
        return <ExportFormatsSettingsSection />;
      case 'archiving':
        return <ArchivingSection />;
      default:
        return <CategoriesSection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Tabs Navigation */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button 
          onClick={handleSaveSettings}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default ExpenseSettingsTab;
