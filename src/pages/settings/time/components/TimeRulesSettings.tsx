
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";
import WarningAlert from "@/components/time/dashboard/components/WarningAlert";

const TimeRulesSettings = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { toast } = useToast();
  const [maxDailyHours, setMaxDailyHours] = useState(10);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState(48);
  const [blockIllegalHours, setBlockIllegalHours] = useState(true);
  const [minDailyRest, setMinDailyRest] = useState(11);
  const [minWeeklyRest, setMinWeeklyRest] = useState(35);
  const [pauseRules, setPauseRules] = useState(true);
  const [detectOvertime, setDetectOvertime] = useState(true);
  const [nightWorkCompensation, setNightWorkCompensation] = useState("time");
  const [autoBreakDetection, setAutoBreakDetection] = useState(false);

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Einstellungen wurden erfolgreich übernommen.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="daily">Tägliche Regeln</TabsTrigger>
          <TabsTrigger value="weekly">Wöchentliche Regeln</TabsTrigger>
          <TabsTrigger value="special">Sonderregeln</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tägliche Arbeitszeitregelungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Maximale tägliche Arbeitszeit</Label>
                    <p className="text-sm text-gray-500">
                      Nach §3 ArbZG darf die werktägliche Arbeitszeit 8 Stunden nicht überschreiten.
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={maxDailyHours}
                        onChange={(e) => setMaxDailyHours(Number(e.target.value))}
                        min={1}
                        max={12}
                        className="w-16"
                      />
                      <span>Std.</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Einstellung: {maxDailyHours} Stunden</Label>
                  <Slider
                    defaultValue={[maxDailyHours]}
                    max={12}
                    min={1}
                    step={0.5}
                    onValueChange={(value) => setMaxDailyHours(value[0])}
                    className="mt-2"
                  />
                </div>
                
                {maxDailyHours > 10 && (
                  <WarningAlert message="Achtung: Die eingestellte Arbeitszeit überschreitet die gesetzliche Höchstarbeitszeit von 10 Stunden, die nur in Ausnahmefällen erlaubt ist." />
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Mindestens tägliche Ruhezeit</Label>
                    <p className="text-sm text-gray-500">
                      Nach §5 ArbZG müssen Arbeitnehmer nach Beendigung der täglichen Arbeitszeit eine ununterbrochene Ruhezeit von mindestens 11 Stunden haben.
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={minDailyRest}
                        onChange={(e) => setMinDailyRest(Number(e.target.value))}
                        min={7}
                        max={12}
                        className="w-16"
                      />
                      <span>Std.</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Einstellung: {minDailyRest} Stunden</Label>
                  <Slider
                    defaultValue={[minDailyRest]}
                    max={12}
                    min={7}
                    step={0.5}
                    onValueChange={(value) => setMinDailyRest(value[0])}
                    className="mt-2"
                  />
                </div>
                
                {minDailyRest < 11 && (
                  <WarningAlert message="Achtung: Die eingestellte Ruhezeit unterschreitet die gesetzlich vorgeschriebenen 11 Stunden." />
                )}
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base">Pausenregelungen anwenden</Label>
                    <p className="text-sm text-gray-500">
                      Nach §4 ArbZG muss die Arbeit durch Pausen unterbrochen werden (30 Min. bei 6-9 Std., 45 Min. ab 9 Std.).
                    </p>
                  </div>
                  <Switch
                    checked={pauseRules}
                    onCheckedChange={setPauseRules}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base">Gesetzlich unzulässige Einträge blockieren</Label>
                    <p className="text-sm text-gray-500">
                      Verhindert das Speichern von Zeiterfassungen, die gegen gesetzliche Vorgaben verstoßen.
                    </p>
                  </div>
                  <Switch
                    checked={blockIllegalHours}
                    onCheckedChange={setBlockIllegalHours}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base">Automatische Pausenerkennung</Label>
                    <p className="text-sm text-gray-500">
                      System erkennt automatisch längere Inaktivität und schlägt Pausen vor.
                    </p>
                  </div>
                  <Switch
                    checked={autoBreakDetection}
                    onCheckedChange={setAutoBreakDetection}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Wöchentliche Arbeitszeitregelungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Maximale wöchentliche Arbeitszeit</Label>
                    <p className="text-sm text-gray-500">
                      Nach §3 ArbZG darf die Arbeitszeit im Durchschnitt 48 Stunden pro Woche nicht überschreiten.
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={maxWeeklyHours}
                        onChange={(e) => setMaxWeeklyHours(Number(e.target.value))}
                        min={35}
                        max={60}
                        className="w-16"
                      />
                      <span>Std.</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Einstellung: {maxWeeklyHours} Stunden</Label>
                  <Slider
                    defaultValue={[maxWeeklyHours]}
                    max={60}
                    min={35}
                    step={1}
                    onValueChange={(value) => setMaxWeeklyHours(value[0])}
                    className="mt-2"
                  />
                </div>
                
                {maxWeeklyHours > 48 && (
                  <WarningAlert message="Achtung: Die eingestellte wöchentliche Arbeitszeit überschreitet die gesetzliche Höchstarbeitszeit von 48 Stunden pro Woche." />
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Mindestens wöchentliche Ruhezeit</Label>
                    <p className="text-sm text-gray-500">
                      Nach §9 ArbZG dürfen Arbeitnehmer sonntags grundsätzlich nicht beschäftigt werden.
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={minWeeklyRest}
                        onChange={(e) => setMinWeeklyRest(Number(e.target.value))}
                        min={24}
                        max={48}
                        className="w-16"
                      />
                      <span>Std.</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Einstellung: {minWeeklyRest} Stunden</Label>
                  <Slider
                    defaultValue={[minWeeklyRest]}
                    max={48}
                    min={24}
                    step={1}
                    onValueChange={(value) => setMinWeeklyRest(value[0])}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="text-base">Überstundenerkennung aktivieren</Label>
                    <p className="text-sm text-gray-500">
                      Überstunden werden automatisch erkannt und markiert.
                    </p>
                  </div>
                  <Switch
                    checked={detectOvertime}
                    onCheckedChange={setDetectOvertime}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="special" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sonderregeln</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Nachtarbeit-Kompensation</Label>
                    <p className="text-sm text-gray-500">
                      Nach §6 ArbZG haben Nachtarbeitnehmer Anspruch auf angemessene Ausgleichszahlungen oder Freizeitausgleich.
                    </p>
                  </div>
                  <Select
                    value={nightWorkCompensation}
                    onValueChange={setNightWorkCompensation}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Kompensation wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine Kompensation</SelectItem>
                      <SelectItem value="money">Gehaltszuschlag</SelectItem>
                      <SelectItem value="time">Freizeitausgleich</SelectItem>
                      <SelectItem value="both">Geld und Freizeit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border p-4 rounded-md bg-gray-50">
                  <h3 className="flex items-center text-base font-medium mb-2">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Hinweise zu Sonderregelungen
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Jugendliche Arbeitnehmer (unter 18 Jahren) unterliegen dem Jugendarbeitsschutzgesetz.</li>
                    <li>Für schwangere und stillende Frauen gelten die besonderen Schutzvorschriften des Mutterschutzgesetzes.</li>
                    <li>Für bestimmte Branchen (z.B. Gesundheitswesen, Transport) können abweichende Regelungen gelten.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default TimeRulesSettings;
