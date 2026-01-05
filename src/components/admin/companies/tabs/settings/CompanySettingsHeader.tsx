
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface CompanySettingsHeaderProps {
  isSaving: boolean;
  handleSaveSettings: () => void;
}

export const CompanySettingsHeader: React.FC<CompanySettingsHeaderProps> = ({
  isSaving,
  handleSaveSettings
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="max-w-full">
        <h3 className="text-lg font-medium break-words">Firmeneinstellungen</h3>
        <p className="text-sm text-gray-500 break-words">Konfigurieren Sie die allgemeinen Einstellungen für diese Firma</p>
      </div>
      <Button 
        onClick={handleSaveSettings}
        disabled={isSaving}
        className="whitespace-nowrap"
      >
        {isSaving ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Speichern...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Einstellungen speichern
          </>
        )}
      </Button>
    </div>
  );
};
