
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EU_REGULATIONS } from "@/utils/workTimeRegulations";

const WorkTimeRegulations = () => {
  const { toast } = useToast();
  const [regulations, setRegulations] = useState({
    maxDailyHours: EU_REGULATIONS.MAX_DAILY_HOURS,
    maxWeeklyHours: EU_REGULATIONS.MAX_WEEKLY_HOURS,
    pauseRequirement6Hours: EU_REGULATIONS.PAUSE_REQUIREMENT_6_HOURS,
    pauseRequirement9Hours: EU_REGULATIONS.PAUSE_REQUIREMENT_9_HOURS,
    dailyRestHours: EU_REGULATIONS.DAILY_REST_HOURS,
    weeklyRestHours: EU_REGULATIONS.WEEKLY_REST_HOURS,
    enforceLaw: true,
    autoPauseAfterHours: 6,
    autoPauseDuration: 30,
    autoPauseDeduction: true,
    allowSundayWork: false,
    allowHolidayWork: false,
    youthProtection: false
  });

  const handleChange = (field: string, value: any) => {
    setRegulations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Arbeitszeit-Regularien wurden aktualisiert.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Gesetzliche Vorgaben</h3>
          <p className="text-sm text-gray-500">
            Einstellungen gemäß dem deutschen Arbeitszeitgesetz (ArbZG)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale tägliche Arbeitszeit</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.maxDailyHours}
                  onChange={(e) => handleChange('maxDailyHours', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Minimale Ruhezeit zwischen Arbeitstagen</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.dailyRestHours}
                  onChange={(e) => handleChange('dailyRestHours', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Maximale wöchentliche Arbeitszeit</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.maxWeeklyHours}
                  onChange={(e) => handleChange('maxWeeklyHours', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Mindestpausenzeit pro Tag</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.pauseRequirement9Hours}
                  onChange={(e) => handleChange('pauseRequirement9Hours', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Minuten
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Arbeitszeitgesetz strikt einhalten</Label>
              <p className="text-sm text-gray-500">
                Verhindert Verstöße gegen gesetzliche Vorgaben
              </p>
            </div>
            <Switch 
              checked={regulations.enforceLaw}
              onCheckedChange={(checked) => handleChange('enforceLaw', checked)}
            />
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Pausenregelungen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Automatische Pause nach</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.autoPauseAfterHours}
                  onChange={(e) => handleChange('autoPauseAfterHours', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Stunden
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Pausendauer</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={regulations.autoPauseDuration}
                  onChange={(e) => handleChange('autoPauseDuration', Number(e.target.value))}
                  className="rounded-r-none" 
                />
                <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md text-gray-600">
                  Minuten
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pausen automatisch abziehen</Label>
              <p className="text-sm text-gray-500">
                Pausenzeiten werden automatisch von der Arbeitszeit abgezogen
              </p>
            </div>
            <Switch 
              checked={regulations.autoPauseDeduction}
              onCheckedChange={(checked) => handleChange('autoPauseDeduction', checked)}
            />
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Sonderregeln</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sonntagsarbeit erlauben</Label>
              <p className="text-sm text-gray-500">
                Gemäß §9 Arbeitszeitgesetz
              </p>
            </div>
            <Switch 
              checked={regulations.allowSundayWork}
              onCheckedChange={(checked) => handleChange('allowSundayWork', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Feiertagsarbeit erlauben</Label>
              <p className="text-sm text-gray-500">
                Gemäß §9 Arbeitszeitgesetz
              </p>
            </div>
            <Switch 
              checked={regulations.allowHolidayWork}
              onCheckedChange={(checked) => handleChange('allowHolidayWork', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Jugendliche Beschäftigte (JArbSchG)</Label>
              <p className="text-sm text-gray-500">
                Besondere Schutzvorschriften für Jugendliche aktivieren
              </p>
            </div>
            <Switch 
              checked={regulations.youthProtection}
              onCheckedChange={(checked) => handleChange('youthProtection', checked)}
            />
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

export default WorkTimeRegulations;
