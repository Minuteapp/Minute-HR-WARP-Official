
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, X, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CalendarBookingRules = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableBookingRules: true,
    blockFridayAfternoon: true,
    fridayBlockTime: "14:00",
    maxAdvanceBookingDays: 90,
    minAdvanceBookingHours: 2,
    maxMeetingDuration: 240,
    lunchBreakStart: "12:00",
    lunchBreakEnd: "13:00",
    blockLunchBreak: true
  });

  const [customRules, setCustomRules] = useState([
    { id: 1, day: "Montag", startTime: "17:00", endTime: "18:00", reason: "Teambesprechung" },
    { id: 2, day: "Mittwoch", startTime: "09:00", endTime: "10:00", reason: "Jour Fixe" }
  ]);

  const handleSave = () => {
    toast({
      title: "Buchungsregeln gespeichert",
      description: "Die Regeln wurden erfolgreich aktualisiert."
    });
  };

  const addCustomRule = () => {
    const newRule = {
      id: Date.now(),
      day: "Montag",
      startTime: "09:00",
      endTime: "10:00",
      reason: "Neue Regel"
    };
    setCustomRules([...customRules, newRule]);
  };

  const removeCustomRule = (id: number) => {
    setCustomRules(customRules.filter(rule => rule.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Standard-Buchungsregeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Buchungsregeln aktivieren</Label>
            <Switch 
              checked={settings.enableBookingRules}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, enableBookingRules: checked}))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max. Tage im Voraus buchbar</Label>
              <Input 
                type="number" 
                value={settings.maxAdvanceBookingDays}
                onChange={(e) => setSettings(prev => ({...prev, maxAdvanceBookingDays: parseInt(e.target.value)}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Min. Stunden im Voraus</Label>
              <Input 
                type="number" 
                value={settings.minAdvanceBookingHours}
                onChange={(e) => setSettings(prev => ({...prev, minAdvanceBookingHours: parseInt(e.target.value)}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max. Meeting-Dauer (Minuten)</Label>
            <Input 
              type="number" 
              value={settings.maxMeetingDuration}
              onChange={(e) => setSettings(prev => ({...prev, maxMeetingDuration: parseInt(e.target.value)}))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Freitag-Nachmittag Regel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Freitag-Nachmittag blockieren</Label>
            <Switch 
              checked={settings.blockFridayAfternoon}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, blockFridayAfternoon: checked}))}
            />
          </div>
          {settings.blockFridayAfternoon && (
            <div className="space-y-2">
              <Label>Blockierung ab Uhrzeit</Label>
              <Input 
                type="time" 
                value={settings.fridayBlockTime}
                onChange={(e) => setSettings(prev => ({...prev, fridayBlockTime: e.target.value}))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mittagspause</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Mittagspause blockieren</Label>
            <Switch 
              checked={settings.blockLunchBreak}
              onCheckedChange={(checked) => 
                setSettings(prev => ({...prev, blockLunchBreak: checked}))}
            />
          </div>
          {settings.blockLunchBreak && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pause von</Label>
                <Input 
                  type="time" 
                  value={settings.lunchBreakStart}
                  onChange={(e) => setSettings(prev => ({...prev, lunchBreakStart: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label>Pause bis</Label>
                <Input 
                  type="time" 
                  value={settings.lunchBreakEnd}
                  onChange={(e) => setSettings(prev => ({...prev, lunchBreakEnd: e.target.value}))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Benutzerdefinierte Regeln
            <Button onClick={addCustomRule} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Regel hinzufügen
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{rule.day}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeCustomRule(rule.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Von: {rule.startTime}</div>
                  <div>Bis: {rule.endTime}</div>
                  <div>Grund: {rule.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Regeln speichern
        </Button>
      </div>
    </div>
  );
};

export default CalendarBookingRules;
