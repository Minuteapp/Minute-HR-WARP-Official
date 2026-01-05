
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CalendarReminderSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableReminders: true,
    defaultReminderMinutes: 15,
    secondReminderMinutes: 60,
    enableSecondReminder: false,
    reminderMethods: ["email", "push"],
    meetingReminderMinutes: 15,
    trainingReminderMinutes: 30,
    personalReminderMinutes: 10,
    enableSmsReminders: false,
    workingHoursOnly: true
  });

  const handleSave = () => {
    toast({
      title: "Erinnerungseinstellungen gespeichert",
      description: "Die Einstellungen wurden erfolgreich aktualisiert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Standard-Erinnerungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Erinnerungen aktivieren</Label>
            <Switch 
              checked={settings.enableReminders}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, enableReminders: checked}))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Standard-Erinnerung (Minuten vorher)</Label>
              <Input 
                type="number" 
                value={settings.defaultReminderMinutes}
                onChange={(e) => setSettings(prev => ({...prev, defaultReminderMinutes: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Zweite Erinnerung (Minuten vorher)</Label>
              <Input 
                type="number" 
                value={settings.secondReminderMinutes}
                onChange={(e) => setSettings(prev => ({...prev, secondReminderMinutes: parseInt(e.target.value)}))}
                disabled={!settings.enableSecondReminder}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Zweite Erinnerung aktivieren</Label>
            <Switch 
              checked={settings.enableSecondReminder}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, enableSecondReminder: checked}))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termintyp-spezifische Erinnerungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Meetings (Minuten vorher)</Label>
              <Input 
                type="number" 
                value={settings.meetingReminderMinutes}
                onChange={(e) => setSettings(prev => ({...prev, meetingReminderMinutes: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Trainings (Minuten vorher)</Label>
              <Input 
                type="number" 
                value={settings.trainingReminderMinutes}
                onChange={(e) => setSettings(prev => ({...prev, trainingReminderMinutes: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Persönliche Termine (Minuten vorher)</Label>
              <Input 
                type="number" 
                value={settings.personalReminderMinutes}
                onChange={(e) => setSettings(prev => ({...prev, personalReminderMinutes: parseInt(e.target.value)}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungsmethoden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>SMS-Erinnerungen</Label>
              <Switch 
                checked={settings.enableSmsReminders}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, enableSmsReminders: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nur während Arbeitszeiten</Label>
              <Switch 
                checked={settings.workingHoursOnly}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, workingHoursOnly: checked}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default CalendarReminderSettings;
