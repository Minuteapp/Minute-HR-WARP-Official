
import React from 'react';
import { UserManagementCard } from './settings/UserManagementCard';
import { SecurityCard } from './settings/SecurityCard';
import { NotificationsCard } from './settings/NotificationsCard';
import { AutomationCard } from './settings/AutomationCard';
import { CompanySettingsHeader } from './settings/CompanySettingsHeader';
import { useCompanySettings } from './settings/useCompanySettings';
import { CompanyDetails } from '../types';

export interface CompanySettingsTabProps {
  companyId?: string;
  company?: CompanyDetails;
}

export const CompanySettingsTab: React.FC<CompanySettingsTabProps> = ({ companyId, company }) => {
  const { settings, isSaving, handleSettingChange, handleSaveSettings } = useCompanySettings();

  return (
    <div className="space-y-6">
      <CompanySettingsHeader 
        isSaving={isSaving} 
        handleSaveSettings={handleSaveSettings} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserManagementCard 
          settings={settings} 
          handleSettingChange={handleSettingChange} 
        />
        
        <SecurityCard 
          settings={settings} 
          handleSettingChange={handleSettingChange} 
        />
        
        <NotificationsCard 
          settings={settings} 
          handleSettingChange={handleSettingChange} 
        />
        
        <AutomationCard 
          settings={settings} 
          handleSettingChange={handleSettingChange} 
        />
      </div>
    </div>
  );
};
