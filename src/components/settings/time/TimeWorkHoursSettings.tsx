
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const TimeWorkHoursSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maxDailyHours: 8,
    maxWeeklyHours: 40,
    overtimeThreshold: 8,
    breakDurationMinutes: 30,
    minimumBreakAfterHours: 6,
    maxContinuousWorkHours: 6,
    nightShiftStart: "22:00",
    nightShiftEnd: "06:00",
    weekendOvertimeMultiplier: 1.5,
    holidayOvertimeMultiplier: 2.0,
    enableFlextime: true,
    coreWorkingHoursStart: "10:00",
    coreWorkingHoursEnd: "15:00"
  });

  const handleSave = () => {
    toast({
      title: "Arbeitszeiteinstellungen gespeichert",
      description: "Die Einstellungen wurden erfolgreich aktualisiert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Grundlegende Arbeitszeiten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max. Stunden pro Tag</Label>
              <Input 
                type="number" 
                step="0.5"
                value={settings.maxDailyHours}
                onChange={(e) => setSettings(prev => ({...prev, maxDailyHours: parseFloat(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max. Stunden pro Woche</Label>
              <Input 
                type="number" 
                step="0.5"
                value={settings.maxWeeklyHours}
                onChange={(e) => setSettings(prev => ({...prev, maxWeeklyHours: parseFloat(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Überstunden ab (Stunden/Tag)</Label>
              <Input 
                type="number" 
                step="0.5"
                value={settings.overtimeThreshold}
                onChange={(e) => setSettings(prev => ({...prev, overtimeThreshold: parseFloat(e.target.value)}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pausenregelungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Standardpause (Minuten)</Label>
              <Input 
                type="number" 
                value={settings.breakDurationMinutes}
                onChange={(e) => setSettings(prev => ({...prev, breakDurationMinutes: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Pause erforderlich nach (Stunden)</Label>
              <Input 
                type="number" 
                value={settings.minimumBreakAfterHours}
                onChange={(e) => setSettings(prev => ({...prev, minimumBreakAfterHours: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Max. kontinuierliche Arbeitszeit</Label>
              <Input 
                type="number" 
                step="0.5"
                value={settings.maxContinuousWorkHours}
                onChange={(e) => setSettings(prev => ({...prev, maxContinuousWorkHours: parseFloat(e.target.value)}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nachtschicht & Zuschläge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nachtschicht von</Label>
              <Input 
                type="time" 
                value={settings.nightShiftStart}
                onChange={(e) => setSettings(prev => ({...prev, nightShiftStart: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nachtschicht bis</Label>
              <Input 
                type="time" 
                value={settings.nightShiftEnd}
                onChange={(e) => setSettings(prev => ({...prev, nightShiftEnd: e.target.value}))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wochenend-Zuschlag (Faktor)</Label>
              <Input 
                type="number" 
                step="0.1"
                value={settings.weekendOvertimeMultiplier}
                onChange={(e) => setSettings(prev => ({...prev, weekendOvertimeMultiplier: parseFloat(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Feiertags-Zuschlag (Faktor)</Label>
              <Input 
                type="number" 
                step="0.1"
                value={settings.holidayOvertimeMultiplier}
                onChange={(e) => setSettings(prev => ({...prev, holidayOvertimeMultiplier: parseFloat(e.target.value)}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flexible Arbeitszeit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Gleitzeit aktivieren</Label>
            <Switch 
              checked={settings.enableFlextime}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, enableFlextime: checked}))}
            />
          </div>
          
          {settings.enableFlextime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kernarbeitszeit von</Label>
                <Input 
                  type="time" 
                  value={settings.coreWorkingHoursStart}
                  onChange={(e) => setSettings(prev => ({...prev, coreWorkingHoursStart: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Kernarbeitszeit bis</Label>
                <Input 
                  type="time" 
                  value={settings.coreWorkingHoursEnd}
                  onChange={(e) => setSettings(prev => ({...prev, coreWorkingHoursEnd: e.target.value}))}
                />
              </div>
            </div>
          )}
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

export default TimeWorkHoursSettings;
