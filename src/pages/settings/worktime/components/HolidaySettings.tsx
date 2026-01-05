import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, Upload, RefreshCw } from 'lucide-react';

const germanStates = [
  { id: 'bw', name: 'Baden-Württemberg' },
  { id: 'by', name: 'Bayern' },
  { id: 'be', name: 'Berlin' },
  { id: 'bb', name: 'Brandenburg' },
  { id: 'hb', name: 'Bremen' },
  { id: 'hh', name: 'Hamburg' },
  { id: 'he', name: 'Hessen' },
  { id: 'mv', name: 'Mecklenburg-Vorpommern' },
  { id: 'ni', name: 'Niedersachsen' },
  { id: 'nw', name: 'Nordrhein-Westfalen' },
  { id: 'rp', name: 'Rheinland-Pfalz' },
  { id: 'sl', name: 'Saarland' },
  { id: 'sn', name: 'Sachsen' },
  { id: 'st', name: 'Sachsen-Anhalt' },
  { id: 'sh', name: 'Schleswig-Holstein' },
  { id: 'th', name: 'Thüringen' }
];

const HolidaySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    autoUpdateHolidays: true,
    showHolidaysInCalendar: true,
    blockTimeTracking: true,
    blockAbsenceRequests: true,
    defaultRegion: 'bw',
    apiEnabled: true,
    customImport: false,
    lastUpdate: new Date().toLocaleDateString()
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Feiertagseinstellungen wurden erfolgreich aktualisiert."
    });
  };

  const handleUpdateHolidays = () => {
    toast({
      title: "Feiertage aktualisiert",
      description: "Die Feiertagsdaten wurden erfolgreich aktualisiert."
    });
    handleSettingChange('lastUpdate', new Date().toLocaleDateString());
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-medium text-lg">Feiertagseinstellungen</h3>
          </div>
          <p className="text-sm text-gray-500">
            Verwalten Sie die Feiertagsregelungen für Ihre Standorte
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Standardregion für Feiertage</Label>
                <p className="text-sm text-gray-500">Wird für neue Standorte verwendet</p>
              </div>
              <div className="w-48">
                <Select 
                  value={settings.defaultRegion}
                  onValueChange={(value) => handleSettingChange('defaultRegion', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {germanStates.map(state => (
                      <SelectItem key={state.id} value={state.id}>{state.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Feiertage im Kalender anzeigen</Label>
                <p className="text-sm text-gray-500">Anzeige im Team- und persönlichen Kalender</p>
              </div>
              <Switch 
                checked={settings.showHolidaysInCalendar} 
                onCheckedChange={(value) => handleSettingChange('showHolidaysInCalendar', value)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Zeiterfassung an Feiertagen blockieren</Label>
                <p className="text-sm text-gray-500">Verhindert Zeiteinträge an gesetzlichen Feiertagen</p>
              </div>
              <Switch 
                checked={settings.blockTimeTracking} 
                onCheckedChange={(value) => handleSettingChange('blockTimeTracking', value)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Abwesenheitsanträge an Feiertagen blockieren</Label>
                <p className="text-sm text-gray-500">Verhindert Urlaubsanträge an gesetzlichen Feiertagen</p>
              </div>
              <Switch 
                checked={settings.blockAbsenceRequests} 
                onCheckedChange={(value) => handleSettingChange('blockAbsenceRequests', value)} 
              />
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Feiertagsdaten</h3>
          <p className="text-sm text-gray-500">
            Verwalten Sie die Feiertage durch automatische oder manuelle Aktualisierung
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Feiertage automatisch aktualisieren</Label>
                <p className="text-sm text-gray-500">Jährliche Aktualisierung über API</p>
              </div>
              <Switch 
                checked={settings.autoUpdateHolidays} 
                onCheckedChange={(value) => handleSettingChange('autoUpdateHolidays', value)} 
              />
            </div>
            
            {settings.autoUpdateHolidays && (
              <div className="ml-6 border-l-2 pl-4 border-l-muted space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API-Verbindung aktivieren</Label>
                    <p className="text-sm text-gray-500">Feiertags-API für automatische Updates</p>
                  </div>
                  <Switch 
                    checked={settings.apiEnabled} 
                    onCheckedChange={(value) => handleSettingChange('apiEnabled', value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Letzte Aktualisierung</Label>
                  <div className="flex items-center gap-2">
                    <Input value={settings.lastUpdate} readOnly className="bg-gray-50" />
                    <Button variant="outline" size="icon" onClick={handleUpdateHolidays}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Benutzerdefinierte Feiertagsliste importieren</Label>
                <p className="text-sm text-gray-500">CSV- oder ICS-Datei hochladen</p>
              </div>
              <Switch 
                checked={settings.customImport} 
                onCheckedChange={(value) => handleSettingChange('customImport', value)} 
              />
            </div>
            
            {settings.customImport && (
              <div className="ml-6 border-l-2 pl-4 border-l-muted">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" /> Feiertagsdatei hochladen
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default HolidaySettings;
