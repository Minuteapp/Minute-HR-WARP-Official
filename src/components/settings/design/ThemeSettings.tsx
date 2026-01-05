
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const themes = [
  { id: 'light', name: 'Hell', preview: 'bg-white border-gray-200' },
  { id: 'dark', name: 'Dunkel', preview: 'bg-gray-900 border-gray-700' },
  { id: 'auto', name: 'Automatisch', preview: 'bg-gradient-to-r from-white to-gray-900' }
];

const colorSchemes = [
  { id: 'blue', name: 'Blau', color: 'bg-blue-500' },
  { id: 'purple', name: 'Lila', color: 'bg-purple-500' },
  { id: 'green', name: 'Grün', color: 'bg-green-500' },
  { id: 'orange', name: 'Orange', color: 'bg-orange-500' }
];

const ThemeSettings = () => {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedColorScheme, setSelectedColorScheme] = useState('purple');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleSave = () => {
    toast({
      title: "Theme gespeichert",
      description: "Die Theme-Einstellungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Farbschema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Theme auswählen</Label>
            <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
              {themes.map((theme) => (
                <div key={theme.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={theme.id} id={theme.id} />
                  <Label htmlFor={theme.id} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-6 h-6 rounded border-2 ${theme.preview}`}></div>
                    {theme.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label>Farbschema</Label>
            <RadioGroup value={selectedColorScheme} onValueChange={setSelectedColorScheme}>
              {colorSchemes.map((scheme) => (
                <div key={scheme.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={scheme.id} id={scheme.id} />
                  <Label htmlFor={scheme.id} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-6 h-6 rounded ${scheme.color}`}></div>
                    {scheme.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Barrierefreiheit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hoher Kontrast</Label>
              <p className="text-sm text-gray-500">Verbessert die Lesbarkeit für Benutzer mit Sehbehinderungen</p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduzierte Bewegung</Label>
              <p className="text-sm text-gray-500">Reduziert Animationen und Übergänge</p>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setSelectedTheme('light');
          setSelectedColorScheme('purple');
          setHighContrast(false);
          setReducedMotion(false);
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};

export default ThemeSettings;
