
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  statusChangeNotifications: boolean;
  approvalReminders: boolean;
  deadlineReminders: boolean;
  reminderIntervalHours: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export const AbsenceNotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    statusChangeNotifications: true,
    approvalReminders: true,
    deadlineReminders: true,
    reminderIntervalHours: 24,
    emailNotifications: true,
    inAppNotifications: true,
  });

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Speichere in localStorage (später in DB)
      localStorage.setItem('absence_notification_settings', JSON.stringify(settings));
      
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Benachrichtigungseinstellungen wurden erfolgreich aktualisiert."
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Benachrichtigungseinstellungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status-change" className="text-base font-medium">
                Statusänderungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen bei Genehmigung oder Ablehnung von Anträgen
              </p>
            </div>
            <Switch
              id="status-change"
              checked={settings.statusChangeNotifications}
              onCheckedChange={(checked) => handleSettingChange('statusChangeNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="approval-reminders" className="text-base font-medium">
                Genehmigungserinnerungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Erinnerungen für ausstehende Genehmigungen
              </p>
            </div>
            <Switch
              id="approval-reminders"
              checked={settings.approvalReminders}
              onCheckedChange={(checked) => handleSettingChange('approvalReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deadline-reminders" className="text-base font-medium">
                Frist-Erinnerungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Erinnerungen vor Ablauf wichtiger Fristen
              </p>
            </div>
            <Switch
              id="deadline-reminders"
              checked={settings.deadlineReminders}
              onCheckedChange={(checked) => handleSettingChange('deadlineReminders', checked)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <Label className="text-base font-medium">Erinnerungsintervall</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Wie oft sollen Erinnerungen gesendet werden?
          </p>
          <Select 
            value={settings.reminderIntervalHours.toString()}
            onValueChange={(value) => handleSettingChange('reminderIntervalHours', parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Alle 6 Stunden</SelectItem>
              <SelectItem value="12">Alle 12 Stunden</SelectItem>
              <SelectItem value="24">Täglich</SelectItem>
              <SelectItem value="48">Alle 2 Tage</SelectItem>
              <SelectItem value="72">Alle 3 Tage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4 space-y-4">
          <Label className="text-base font-medium">Benachrichtigungskanäle</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                E-Mail-Benachrichtigungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen per E-Mail erhalten
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-notifications" className="text-base">
                In-App-Benachrichtigungen
              </Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen in der Anwendung anzeigen
              </p>
            </div>
            <Switch
              id="inapp-notifications"
              checked={settings.inAppNotifications}
              onCheckedChange={(checked) => handleSettingChange('inAppNotifications', checked)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
