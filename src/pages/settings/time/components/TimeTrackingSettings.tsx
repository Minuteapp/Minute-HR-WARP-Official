
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const TimeTrackingSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    workModel: "flex",
    weeklyHours: "40",
    coreTimeStart: "09:00",
    coreTimeEnd: "16:00",
    notifications: {
      missingEntry: true,
      breakReminder: true,
      overtimeWarning: true
    },
    automation: {
      autoBreak: false,
      autoCheckout: false
    }
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked
      }
    }));

    if (checked) {
      // Request notification permissions
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Benachrichtigungen aktiviert",
              description: "Sie werden nun über wichtige Ereignisse informiert.",
            });
          }
        });
      }
    }
  };

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Einstellungen wurden erfolgreich aktualisiert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Arbeitszeitmodell</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Arbeitszeitmodell</Label>
              <Select 
                defaultValue={settings.workModel}
                onValueChange={(value) => setSettings(prev => ({ ...prev, workModel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modell wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex">Gleitzeit</SelectItem>
                  <SelectItem value="fixed">Feste Arbeitszeit</SelectItem>
                  <SelectItem value="shift">Schichtarbeit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wochenstunden</Label>
              <Input 
                type="number" 
                value={settings.weeklyHours}
                onChange={(e) => setSettings(prev => ({ ...prev, weeklyHours: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kernarbeitszeit</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="time" 
                value={settings.coreTimeStart}
                onChange={(e) => setSettings(prev => ({ ...prev, coreTimeStart: e.target.value }))}
              />
              <Input 
                type="time" 
                value={settings.coreTimeEnd}
                onChange={(e) => setSettings(prev => ({ ...prev, coreTimeEnd: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Benachrichtigungen</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Erinnerung bei fehlender Zeiterfassung</Label>
              <p className="text-sm text-gray-600">Erhalte eine Benachrichtigung, wenn du vergisst ein- oder auszustempeln</p>
            </div>
            <Switch 
              checked={settings.notifications.missingEntry}
              onCheckedChange={(checked) => handleNotificationChange('missingEntry', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pausenerinnerung</Label>
              <p className="text-sm text-gray-600">Erhalte eine Benachrichtigung, wenn eine Pause fällig ist</p>
            </div>
            <Switch 
              checked={settings.notifications.breakReminder}
              onCheckedChange={(checked) => handleNotificationChange('breakReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Überstundenwarnung</Label>
              <p className="text-sm text-gray-600">Benachrichtigung bei Überschreitung der regulären Arbeitszeit</p>
            </div>
            <Switch 
              checked={settings.notifications.overtimeWarning}
              onCheckedChange={(checked) => handleNotificationChange('overtimeWarning', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Automatisierung</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatische Pausenbuchung</Label>
              <p className="text-sm text-gray-600">Automatische Buchung der gesetzlichen Pausen</p>
            </div>
            <Switch 
              checked={settings.automation.autoBreak}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                automation: { ...prev.automation, autoBreak: checked }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatisches Auschecken</Label>
              <p className="text-sm text-gray-600">Automatisches Auschecken nach Arbeitsende</p>
            </div>
            <Switch 
              checked={settings.automation.autoCheckout}
              onCheckedChange={(checked) => setSettings(prev => ({
                ...prev,
                automation: { ...prev.automation, autoCheckout: checked }
              }))}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Abbrechen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default TimeTrackingSettings;
