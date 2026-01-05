
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const layoutOptions = [
  { id: 'sidebar-left', name: 'Sidebar links', description: 'Navigation auf der linken Seite' },
  { id: 'sidebar-right', name: 'Sidebar rechts', description: 'Navigation auf der rechten Seite' },
  { id: 'top-nav', name: 'Top Navigation', description: 'Navigation oben' }
];

const LayoutSettings = () => {
  const { toast } = useToast();
  const [selectedLayout, setSelectedLayout] = useState('sidebar-left');
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentWidth, setContentWidth] = useState([80]);

  const handleSave = () => {
    toast({
      title: "Layout gespeichert",
      description: "Die Layout-Einstellungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout-Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Navigation Position</Label>
            <RadioGroup value={selectedLayout} onValueChange={setSelectedLayout}>
              {layoutOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="cursor-pointer font-medium">
                      {option.name}
                    </Label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Content Breite (%)</Label>
            <div className="px-2">
              <Slider
                value={contentWidth}
                onValueChange={setContentWidth}
                max={100}
                min={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>60%</span>
                <span className="font-medium">{contentWidth[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Darstellungsoptionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Kompakter Modus</Label>
              <p className="text-sm text-gray-500">Reduziert Abstände und Elementgrößen</p>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sidebar standardmäßig eingeklappt</Label>
              <p className="text-sm text-gray-500">Startet mit eingeklappter Navigation</p>
            </div>
            <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setSelectedLayout('sidebar-left');
          setCompactMode(false);
          setSidebarCollapsed(false);
          setContentWidth([80]);
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};

export default LayoutSettings;
