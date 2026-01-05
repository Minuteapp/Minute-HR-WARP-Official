
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TimeModels = () => {
  const [activeTab, setActiveTab] = useState("standard");
  
  const handleSave = () => {
    toast({
      title: "Arbeitszeitmodelle gespeichert",
      description: "Die Änderungen wurden erfolgreich übernommen.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="standard">Standardmodelle</TabsTrigger>
          <TabsTrigger value="flex">Gleitzeit</TabsTrigger>
          <TabsTrigger value="shift">Schichtmodelle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Festzeit-Modell</h3>
                  <p className="text-sm text-gray-500">Feste Arbeitszeiten von 9-17 Uhr</p>
                </div>
                <Switch id="standard-model" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Arbeitsbeginn</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label>Arbeitsende</Label>
                  <Input type="time" defaultValue="17:00" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Teilzeit-Modell</h3>
                  <p className="text-sm text-gray-500">Reduzierte Arbeitszeit (20-30 Std/Woche)</p>
                </div>
                <Switch id="part-time-model" />
              </div>
              
              <div className="space-y-2">
                <Label>Wochenstunden</Label>
                <Input type="number" defaultValue="25" />
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="flex" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Kernzeit-Gleitzeit</h3>
                  <p className="text-sm text-gray-500">Flexible Arbeitszeit mit Kernzeit-Präsenz</p>
                </div>
                <Switch id="flex-core-time" defaultChecked />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kernzeit Beginn</Label>
                  <Input type="time" defaultValue="10:00" />
                </div>
                <div className="space-y-2">
                  <Label>Kernzeit Ende</Label>
                  <Input type="time" defaultValue="15:00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Früheste Startzeit</Label>
                  <Input type="time" defaultValue="06:00" />
                </div>
                <div className="space-y-2">
                  <Label>Späteste Endzeit</Label>
                  <Input type="time" defaultValue="20:00" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Vollflexibles Modell</h3>
                  <p className="text-sm text-gray-500">Komplett flexible Arbeitszeit ohne Kernzeit</p>
                </div>
                <Switch id="fully-flex" />
              </div>
              
              <div className="space-y-2">
                <Label>Ausgleichszeitraum</Label>
                <Select defaultValue="month">
                  <SelectTrigger>
                    <SelectValue placeholder="Zeitraum wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Wöchentlich</SelectItem>
                    <SelectItem value="month">Monatlich</SelectItem>
                    <SelectItem value="quarter">Quartalsweise</SelectItem>
                    <SelectItem value="year">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="shift" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Schichtmodelle</h3>
                  <p className="text-sm text-gray-500">Verfügbare Schichtmodelle konfigurieren</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 flex items-center justify-between">
                  <Label>Frühschicht</Label>
                  <Switch id="early-shift" defaultChecked />
                </div>
                <div className="space-y-2 flex items-center justify-between">
                  <Label>Spätschicht</Label>
                  <Switch id="late-shift" defaultChecked />
                </div>
                <div className="space-y-2 flex items-center justify-between">
                  <Label>Nachtschicht</Label>
                  <Switch id="night-shift" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Schichtmodell konfigurieren</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    Schichtplanung öffnen
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schichtregel-Einstellungen
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Abbrechen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>
    </div>
  );
};

export default TimeModels;
