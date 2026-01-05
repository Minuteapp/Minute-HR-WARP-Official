import { Settings } from 'lucide-react';

const SettingsHeader = () => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>
      <p className="text-muted-foreground">
        Konfiguration des Projekt-Moduls
      </p>
    </div>
  );
};

export default SettingsHeader;
