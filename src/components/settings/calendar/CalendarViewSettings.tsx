
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CalendarViewSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultViewEmployee: "month",
    defaultViewManager: "week", 
    defaultViewAdmin: "month",
    enableDayView: true,
    enableWeekView: true,
    enableMonthView: true,
    enableYearView: false,
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    weekStartsOn: "monday",
    showWeekNumbers: true,
    showWeekends: true,
    timeFormat: "24h"
  });

  const handleSave = () => {
    toast({
      title: "Kalender-Ansichten gespeichert",
      description: "Die Einstellungen wurden erfolgreich aktualisiert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Standard-Ansichten pro Nutzerrolle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Mitarbeiter Standard-Ansicht</Label>
              <Select value={settings.defaultViewEmployee} onValueChange={(value) => 
                setSettings(prev => ({...prev, defaultViewEmployee: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Tag</SelectItem>
                  <SelectItem value="week">Woche</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Manager Standard-Ansicht</Label>
              <Select value={settings.defaultViewManager} onValueChange={(value) => 
                setSettings(prev => ({...prev, defaultViewManager: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Tag</SelectItem>
                  <SelectItem value="week">Woche</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Admin Standard-Ansicht</Label>
              <Select value={settings.defaultViewAdmin} onValueChange={(value) => 
                setSettings(prev => ({...prev, defaultViewAdmin: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Tag</SelectItem>
                  <SelectItem value="week">Woche</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Ansichten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Tagesansicht aktivieren</Label>
              <Switch 
                checked={settings.enableDayView}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, enableDayView: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Wochenansicht aktivieren</Label>
              <Switch 
                checked={settings.enableWeekView}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, enableWeekView: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Monatsansicht aktivieren</Label>
              <Switch 
                checked={settings.enableMonthView}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, enableMonthView: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Jahresansicht aktivieren</Label>
              <Switch 
                checked={settings.enableYearView}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, enableYearView: checked}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weitere Anzeigeoptionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Kalenderwochen anzeigen</Label>
              <Switch 
                checked={settings.showWeekNumbers}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, showWeekNumbers: checked}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Wochenenden anzeigen</Label>
              <Switch 
                checked={settings.showWeekends}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, showWeekends: checked}))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Woche beginnt am</Label>
              <Select value={settings.weekStartsOn} onValueChange={(value) => 
                setSettings(prev => ({...prev, weekStartsOn: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Montag</SelectItem>
                  <SelectItem value="sunday">Sonntag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zeitformat</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => 
                setSettings(prev => ({...prev, timeFormat: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24h Format</SelectItem>
                  <SelectItem value="12h">12h Format (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
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

export default CalendarViewSettings;
