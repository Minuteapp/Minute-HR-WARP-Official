
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { SickLeaveSettings as SickLeaveSettingsType } from '@/types/sick-leave';
import { Checkbox } from '@/components/ui/checkbox';

const SickLeaveSettings = () => {
  const { toast } = useToast();
  
  // Demo-Einstellungen
  const [settings, setSettings] = useState<SickLeaveSettingsType>({
    enableAutomaticNotifications: true,
    requireDocumentUpload: true,
    documentUploadDays: 3,
    enableChildSickLeave: true,
    enablePartialDaySickLeave: true,
    defaultApprovalRequired: false,
    notifyManager: true,
    notifyHR: true,
    notifyColleagues: false,
    notificationChannels: ['email', 'inApp'],
    reminderEnabled: true,
    reminderDays: 2,
    restrictSensitiveData: true,
    dataRetentionMonths: 12,
    anonymizeStatistics: true,
    showOnlyToAuthorizedUsers: true
  });
  
  const handleToggle = (field: keyof SickLeaveSettingsType) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleInputChange = (field: keyof SickLeaveSettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleChannelToggle = (channel: string) => {
    setSettings(prev => {
      const currentChannels = prev.notificationChannels || [];
      
      if (currentChannels.includes(channel)) {
        return {
          ...prev,
          notificationChannels: currentChannels.filter(c => c !== channel)
        };
      } else {
        return {
          ...prev,
          notificationChannels: [...currentChannels, channel]
        };
      }
    });
  };
  
  const saveSettings = () => {
    // Hier würde in einer realen Anwendung ein API-Aufruf stattfinden
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Einstellungen wurden erfolgreich gespeichert.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Allgemeine Einstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie die grundlegenden Einstellungen für Krankmeldungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireDocumentUpload">Arbeitsunfähigkeitsbescheinigung erforderlich</Label>
                  <p className="text-sm text-muted-foreground">
                    Erfordert das Hochladen einer ärztlichen Bescheinigung
                  </p>
                </div>
                <Switch
                  id="requireDocumentUpload"
                  checked={settings.requireDocumentUpload}
                  onCheckedChange={() => handleToggle('requireDocumentUpload')}
                />
              </div>
              
              {settings.requireDocumentUpload && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="documentUploadDays">Frist für Einreichung (Tage)</Label>
                  <div className="max-w-[180px]">
                    <Select
                      value={settings.documentUploadDays.toString()}
                      onValueChange={(value) => handleInputChange('documentUploadDays', parseInt(value))}
                    >
                      <SelectTrigger id="documentUploadDays">
                        <SelectValue placeholder="Tage auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Tag</SelectItem>
                        <SelectItem value="2">2 Tage</SelectItem>
                        <SelectItem value="3">3 Tage</SelectItem>
                        <SelectItem value="5">5 Tage</SelectItem>
                        <SelectItem value="7">7 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableChildSickLeave">Kinderkrankmeldungen aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Erlaubt die Erfassung von Krankmeldungen für Kinder
                  </p>
                </div>
                <Switch
                  id="enableChildSickLeave"
                  checked={settings.enableChildSickLeave}
                  onCheckedChange={() => handleToggle('enableChildSickLeave')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enablePartialDaySickLeave">Teilweise Krankmeldungen erlauben</Label>
                  <p className="text-sm text-muted-foreground">
                    Ermöglicht stundenweise Krankmeldungen
                  </p>
                </div>
                <Switch
                  id="enablePartialDaySickLeave"
                  checked={settings.enablePartialDaySickLeave}
                  onCheckedChange={() => handleToggle('enablePartialDaySickLeave')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="defaultApprovalRequired">Genehmigung erforderlich</Label>
                  <p className="text-sm text-muted-foreground">
                    Krankmeldungen müssen von Vorgesetzten genehmigt werden
                  </p>
                </div>
                <Switch
                  id="defaultApprovalRequired"
                  checked={settings.defaultApprovalRequired}
                  onCheckedChange={() => handleToggle('defaultApprovalRequired')}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAutomaticNotifications">Automatische Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Sendet Benachrichtigungen bei neuen und aktualisierten Krankmeldungen
                  </p>
                </div>
                <Switch
                  id="enableAutomaticNotifications"
                  checked={settings.enableAutomaticNotifications}
                  onCheckedChange={() => handleToggle('enableAutomaticNotifications')}
                />
              </div>
              
              {settings.enableAutomaticNotifications && (
                <div className="space-y-3 ml-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notifyManager"
                      checked={settings.notifyManager}
                      onCheckedChange={() => handleToggle('notifyManager')}
                    />
                    <Label htmlFor="notifyManager">Vorgesetzte benachrichtigen</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notifyHR"
                      checked={settings.notifyHR}
                      onCheckedChange={() => handleToggle('notifyHR')}
                    />
                    <Label htmlFor="notifyHR">HR-Abteilung benachrichtigen</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notifyColleagues"
                      checked={settings.notifyColleagues}
                      onCheckedChange={() => handleToggle('notifyColleagues')}
                    />
                    <Label htmlFor="notifyColleagues">Teammitglieder benachrichtigen</Label>
                  </div>
                  
                  <Label className="block mt-3 mb-1">Benachrichtigungskanäle</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channelEmail"
                        checked={settings.notificationChannels.includes('email')}
                        onCheckedChange={() => handleChannelToggle('email')}
                      />
                      <Label htmlFor="channelEmail">E-Mail</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channelInApp"
                        checked={settings.notificationChannels.includes('inApp')}
                        onCheckedChange={() => handleChannelToggle('inApp')}
                      />
                      <Label htmlFor="channelInApp">In-App Benachrichtigung</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="channelSMS"
                        checked={settings.notificationChannels.includes('sms')}
                        onCheckedChange={() => handleChannelToggle('sms')}
                      />
                      <Label htmlFor="channelSMS">SMS</Label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminderEnabled">Erinnerungen aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Sendet Erinnerungen für ausstehende Bescheinigungen
                  </p>
                </div>
                <Switch
                  id="reminderEnabled"
                  checked={settings.reminderEnabled}
                  onCheckedChange={() => handleToggle('reminderEnabled')}
                />
              </div>
              
              {settings.reminderEnabled && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="reminderDays">Erinnerung vor Ablauf (Tage)</Label>
                  <div className="max-w-[180px]">
                    <Select
                      value={settings.reminderDays.toString()}
                      onValueChange={(value) => handleInputChange('reminderDays', parseInt(value))}
                    >
                      <SelectTrigger id="reminderDays">
                        <SelectValue placeholder="Tage auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Tag</SelectItem>
                        <SelectItem value="2">2 Tage</SelectItem>
                        <SelectItem value="3">3 Tage</SelectItem>
                        <SelectItem value="5">5 Tage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Datenschutz-Einstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie Datenschutzeinstellungen für Krankmeldungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="restrictSensitiveData">Sensible Daten beschränken</Label>
                  <p className="text-sm text-muted-foreground">
                    Beschränkt den Zugriff auf medizinische Details
                  </p>
                </div>
                <Switch
                  id="restrictSensitiveData"
                  checked={settings.restrictSensitiveData}
                  onCheckedChange={() => handleToggle('restrictSensitiveData')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymizeStatistics">Statistiken anonymisieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Zeigt anonymisierte Daten in Statistiken an
                  </p>
                </div>
                <Switch
                  id="anonymizeStatistics"
                  checked={settings.anonymizeStatistics}
                  onCheckedChange={() => handleToggle('anonymizeStatistics')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showOnlyToAuthorizedUsers">Nur für autorisierte Benutzer anzeigen</Label>
                  <p className="text-sm text-muted-foreground">
                    Beschränkt die Sichtbarkeit auf berechtigte Benutzer
                  </p>
                </div>
                <Switch
                  id="showOnlyToAuthorizedUsers"
                  checked={settings.showOnlyToAuthorizedUsers}
                  onCheckedChange={() => handleToggle('showOnlyToAuthorizedUsers')}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataRetentionMonths">Datenspeicherungsdauer (Monate)</Label>
                <div className="max-w-[180px]">
                  <Select
                    value={settings.dataRetentionMonths.toString()}
                    onValueChange={(value) => handleInputChange('dataRetentionMonths', parseInt(value))}
                  >
                    <SelectTrigger id="dataRetentionMonths">
                      <SelectValue placeholder="Monate auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Monate</SelectItem>
                      <SelectItem value="12">12 Monate</SelectItem>
                      <SelectItem value="24">24 Monate</SelectItem>
                      <SelectItem value="36">36 Monate</SelectItem>
                      <SelectItem value="60">60 Monate</SelectItem>
                      <SelectItem value="120">10 Jahre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nach Ablauf dieser Zeit werden Krankmeldungen automatisch anonymisiert
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={saveSettings}>Einstellungen speichern</Button>
      </div>
    </div>
  );
};

export default SickLeaveSettings;
